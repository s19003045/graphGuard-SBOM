using System.Text;
using System.Text.Json;
using GraphGuard.Domain.Graph;

namespace GraphGuard.Infrastructure.Graph;

public sealed class SbomGraphProjectionService : ISbomGraphProjectionService
{
    public Task<ProjectDependencyGraphData> BuildProjectGraphAsync(
        string projectId,
        string sourceType,
        string sbomJson,
        CancellationToken cancellationToken)
    {
        using var document = JsonDocument.Parse(sbomJson);

        var source = sourceType.Trim().ToLowerInvariant();
        var graph = source switch
        {
            "cyclonedx" => BuildCycloneDxGraph(projectId, document.RootElement),
            "spdx" => BuildSpdxGraph(projectId, document.RootElement),
            _ => new ProjectDependencyGraphData(projectId, Array.Empty<PackageVersion>(), Array.Empty<DependencyEdge>())
        };

        return Task.FromResult(graph);
    }

    private static ProjectDependencyGraphData BuildCycloneDxGraph(string projectId, JsonElement root)
    {
        var componentsByRef = new Dictionary<string, PackageVersion>(StringComparer.Ordinal);
        var outgoingByRef = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);
        var incomingCount = new Dictionary<string, int>(StringComparer.Ordinal);

        if (root.TryGetProperty("components", out var components) && components.ValueKind == JsonValueKind.Array)
        {
            foreach (var component in components.EnumerateArray())
            {
                if (!TryReadCycloneDxComponent(component, out var componentRef, out var packageVersion))
                {
                    continue;
                }

                componentsByRef[componentRef] = packageVersion;
                outgoingByRef.TryAdd(componentRef, new HashSet<string>(StringComparer.Ordinal));
                incomingCount.TryAdd(componentRef, 0);
            }
        }

        if (root.TryGetProperty("dependencies", out var dependencies) && dependencies.ValueKind == JsonValueKind.Array)
        {
            foreach (var dependency in dependencies.EnumerateArray())
            {
                if (!dependency.TryGetProperty("ref", out var fromRefElement) || fromRefElement.ValueKind != JsonValueKind.String)
                {
                    continue;
                }

                var fromRef = fromRefElement.GetString();
                if (string.IsNullOrWhiteSpace(fromRef))
                {
                    continue;
                }

                outgoingByRef.TryAdd(fromRef, new HashSet<string>(StringComparer.Ordinal));

                if (!dependency.TryGetProperty("dependsOn", out var dependsOn) || dependsOn.ValueKind != JsonValueKind.Array)
                {
                    continue;
                }

                foreach (var dependsOnRef in dependsOn.EnumerateArray())
                {
                    if (dependsOnRef.ValueKind != JsonValueKind.String)
                    {
                        continue;
                    }

                    var toRef = dependsOnRef.GetString();
                    if (string.IsNullOrWhiteSpace(toRef) || !componentsByRef.ContainsKey(toRef))
                    {
                        continue;
                    }

                    if (outgoingByRef[fromRef].Add(toRef))
                    {
                        incomingCount[toRef] = incomingCount.TryGetValue(toRef, out var current) ? current + 1 : 1;
                    }
                }
            }
        }

        string? rootRef = null;
        if (root.TryGetProperty("metadata", out var metadata)
            && metadata.ValueKind == JsonValueKind.Object
            && metadata.TryGetProperty("component", out var rootComponent)
            && rootComponent.ValueKind == JsonValueKind.Object
            && rootComponent.TryGetProperty("bom-ref", out var rootRefElement)
            && rootRefElement.ValueKind == JsonValueKind.String)
        {
            rootRef = rootRefElement.GetString();
        }

        if (!string.IsNullOrWhiteSpace(rootRef) && componentsByRef.ContainsKey(rootRef))
        {
            componentsByRef.Remove(rootRef);
            incomingCount.Remove(rootRef);
        }

        var directRefs = ResolveDirectReferences(rootRef, outgoingByRef, incomingCount, componentsByRef.Keys);
        return BuildGraph(projectId, componentsByRef, outgoingByRef, directRefs);
    }

    private static ProjectDependencyGraphData BuildSpdxGraph(string projectId, JsonElement root)
    {
        var packagesById = new Dictionary<string, PackageVersion>(StringComparer.Ordinal);
        var outgoingById = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);
        var incomingCount = new Dictionary<string, int>(StringComparer.Ordinal);

        if (root.TryGetProperty("packages", out var packages) && packages.ValueKind == JsonValueKind.Array)
        {
            foreach (var package in packages.EnumerateArray())
            {
                if (!TryReadSpdxPackage(package, out var packageId, out var packageVersion))
                {
                    continue;
                }

                packagesById[packageId] = packageVersion;
                outgoingById.TryAdd(packageId, new HashSet<string>(StringComparer.Ordinal));
                incomingCount.TryAdd(packageId, 0);
            }
        }

        if (root.TryGetProperty("relationships", out var relationships) && relationships.ValueKind == JsonValueKind.Array)
        {
            foreach (var relationship in relationships.EnumerateArray())
            {
                if (!relationship.TryGetProperty("relationshipType", out var relationshipType)
                    || relationshipType.ValueKind != JsonValueKind.String)
                {
                    continue;
                }

                if (!string.Equals(relationshipType.GetString(), "DEPENDS_ON", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (!relationship.TryGetProperty("spdxElementId", out var fromElement)
                    || fromElement.ValueKind != JsonValueKind.String)
                {
                    continue;
                }

                if (!relationship.TryGetProperty("relatedSpdxElement", out var toElement)
                    || toElement.ValueKind != JsonValueKind.String)
                {
                    continue;
                }

                var fromId = fromElement.GetString();
                var toId = toElement.GetString();
                if (string.IsNullOrWhiteSpace(fromId) || string.IsNullOrWhiteSpace(toId))
                {
                    continue;
                }

                if (!packagesById.ContainsKey(toId))
                {
                    continue;
                }

                outgoingById.TryAdd(fromId, new HashSet<string>(StringComparer.Ordinal));

                if (outgoingById[fromId].Add(toId))
                {
                    incomingCount[toId] = incomingCount.TryGetValue(toId, out var current) ? current + 1 : 1;
                }
            }
        }

        string? rootPackageId = null;
        if (root.TryGetProperty("documentDescribes", out var documentDescribes)
            && documentDescribes.ValueKind == JsonValueKind.Array)
        {
            rootPackageId = documentDescribes.EnumerateArray()
                .Where(item => item.ValueKind == JsonValueKind.String)
                .Select(item => item.GetString())
                .FirstOrDefault(id => !string.IsNullOrWhiteSpace(id));
        }

        if (!string.IsNullOrWhiteSpace(rootPackageId) && packagesById.ContainsKey(rootPackageId))
        {
            packagesById.Remove(rootPackageId);
            incomingCount.Remove(rootPackageId);
        }

        var directRefs = ResolveDirectReferences(rootPackageId, outgoingById, incomingCount, packagesById.Keys);
        return BuildGraph(projectId, packagesById, outgoingById, directRefs);
    }

    private static ProjectDependencyGraphData BuildGraph(
        string projectId,
        IReadOnlyDictionary<string, PackageVersion> packagesByRef,
        IReadOnlyDictionary<string, HashSet<string>> outgoingByRef,
        IReadOnlyCollection<string> directRefs)
    {
        var projectNodeId = $"project-{projectId}";
        var depthByRef = ComputeDepthByReference(directRefs, outgoingByRef);

        var edgeDedup = new HashSet<string>(StringComparer.Ordinal);
        var edges = new List<DependencyEdge>();

        foreach (var directRef in directRefs)
        {
            if (!packagesByRef.TryGetValue(directRef, out var directPackage))
            {
                continue;
            }

            AddEdge(edges, edgeDedup, projectNodeId, directPackage.PackageVersionId, 1, true);
        }

        foreach (var (fromRef, targets) in outgoingByRef)
        {
            if (!packagesByRef.TryGetValue(fromRef, out var fromPackage))
            {
                continue;
            }

            foreach (var toRef in targets)
            {
                if (!packagesByRef.TryGetValue(toRef, out var toPackage))
                {
                    continue;
                }

                var depth = depthByRef.TryGetValue(toRef, out var resolvedDepth) ? resolvedDepth : 2;
                AddEdge(edges, edgeDedup, fromPackage.PackageVersionId, toPackage.PackageVersionId, Math.Max(depth, 2), false);
            }
        }

        return new ProjectDependencyGraphData(projectId, packagesByRef.Values.ToArray(), edges);
    }

    private static Dictionary<string, int> ComputeDepthByReference(
        IReadOnlyCollection<string> directRefs,
        IReadOnlyDictionary<string, HashSet<string>> outgoingByRef)
    {
        var depthByRef = new Dictionary<string, int>(StringComparer.Ordinal);
        var queue = new Queue<string>();

        foreach (var directRef in directRefs)
        {
            if (depthByRef.TryAdd(directRef, 1))
            {
                queue.Enqueue(directRef);
            }
        }

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            if (!outgoingByRef.TryGetValue(current, out var targets))
            {
                continue;
            }

            foreach (var next in targets)
            {
                var nextDepth = depthByRef[current] + 1;
                if (!depthByRef.TryGetValue(next, out var existingDepth) || nextDepth < existingDepth)
                {
                    depthByRef[next] = nextDepth;
                    queue.Enqueue(next);
                }
            }
        }

        return depthByRef;
    }

    private static IReadOnlyCollection<string> ResolveDirectReferences(
        string? rootRef,
        IReadOnlyDictionary<string, HashSet<string>> outgoingByRef,
        IReadOnlyDictionary<string, int> incomingCount,
        IEnumerable<string> knownRefs)
    {
        if (!string.IsNullOrWhiteSpace(rootRef)
            && outgoingByRef.TryGetValue(rootRef, out var rootDependencies)
            && rootDependencies.Count > 0)
        {
            return rootDependencies;
        }

        var directRefs = incomingCount
            .Where(pair => pair.Value == 0)
            .Select(pair => pair.Key)
            .ToArray();

        if (directRefs.Length > 0)
        {
            return directRefs;
        }

        return knownRefs.ToArray();
    }

    private static void AddEdge(
        ICollection<DependencyEdge> edges,
        ISet<string> dedup,
        string fromPackageVersionId,
        string toPackageVersionId,
        int depth,
        bool isDirect)
    {
        var dedupKey = $"{fromPackageVersionId}->{toPackageVersionId}";
        if (!dedup.Add(dedupKey))
        {
            return;
        }

        var edgeId = $"edge-{Math.Abs(dedupKey.GetHashCode(StringComparison.Ordinal))}";
        edges.Add(new DependencyEdge(edgeId, fromPackageVersionId, toPackageVersionId, depth, isDirect));
    }

    private static bool TryReadCycloneDxComponent(
        JsonElement component,
        out string componentRef,
        out PackageVersion packageVersion)
    {
        componentRef = string.Empty;
        packageVersion = default!;

        if (!component.TryGetProperty("name", out var nameElement) || nameElement.ValueKind != JsonValueKind.String)
        {
            return false;
        }

        var packageName = nameElement.GetString();
        if (string.IsNullOrWhiteSpace(packageName))
        {
            return false;
        }

        var version = component.TryGetProperty("version", out var versionElement) && versionElement.ValueKind == JsonValueKind.String
            ? versionElement.GetString() ?? "unknown"
            : "unknown";

        componentRef = component.TryGetProperty("bom-ref", out var bomRefElement) && bomRefElement.ValueKind == JsonValueKind.String
            ? bomRefElement.GetString() ?? string.Empty
            : string.Empty;

        if (string.IsNullOrWhiteSpace(componentRef))
        {
            componentRef = $"{packageName}@{version}";
        }

        var ecosystem = InferEcosystem(component);
        var packageVersionId = BuildPackageVersionId(ecosystem, packageName, version);
        packageVersion = new PackageVersion(packageVersionId, ecosystem, packageName, version);
        return true;
    }

    private static bool TryReadSpdxPackage(
        JsonElement package,
        out string packageId,
        out PackageVersion packageVersion)
    {
        packageId = string.Empty;
        packageVersion = default!;

        if (!package.TryGetProperty("SPDXID", out var idElement) || idElement.ValueKind != JsonValueKind.String)
        {
            return false;
        }

        packageId = idElement.GetString() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(packageId))
        {
            return false;
        }

        if (!package.TryGetProperty("name", out var nameElement) || nameElement.ValueKind != JsonValueKind.String)
        {
            return false;
        }

        var packageName = nameElement.GetString();
        if (string.IsNullOrWhiteSpace(packageName))
        {
            return false;
        }

        var version = package.TryGetProperty("versionInfo", out var versionElement) && versionElement.ValueKind == JsonValueKind.String
            ? versionElement.GetString() ?? "unknown"
            : "unknown";

        var ecosystem = InferSpdxEcosystem(package);
        var packageVersionId = BuildPackageVersionId(ecosystem, packageName, version);
        packageVersion = new PackageVersion(packageVersionId, ecosystem, packageName, version);
        return true;
    }

    private static string InferEcosystem(JsonElement component)
    {
        if (component.TryGetProperty("purl", out var purlElement)
            && purlElement.ValueKind == JsonValueKind.String)
        {
            var purl = purlElement.GetString();
            if (!string.IsNullOrWhiteSpace(purl))
            {
                return ParseEcosystemFromPurl(purl);
            }
        }

        if (component.TryGetProperty("type", out var typeElement)
            && typeElement.ValueKind == JsonValueKind.String)
        {
            var type = typeElement.GetString();
            if (!string.IsNullOrWhiteSpace(type) && !string.Equals(type, "library", StringComparison.OrdinalIgnoreCase))
            {
                return type.ToLowerInvariant();
            }
        }

        return "unknown";
    }

    private static string InferSpdxEcosystem(JsonElement package)
    {
        if (package.TryGetProperty("externalRefs", out var refsElement)
            && refsElement.ValueKind == JsonValueKind.Array)
        {
            foreach (var externalRef in refsElement.EnumerateArray())
            {
                if (!externalRef.TryGetProperty("referenceType", out var referenceType)
                    || referenceType.ValueKind != JsonValueKind.String)
                {
                    continue;
                }

                if (!string.Equals(referenceType.GetString(), "purl", StringComparison.OrdinalIgnoreCase))
                {
                    continue;
                }

                if (!externalRef.TryGetProperty("referenceLocator", out var locator)
                    || locator.ValueKind != JsonValueKind.String)
                {
                    continue;
                }

                var purl = locator.GetString();
                if (!string.IsNullOrWhiteSpace(purl))
                {
                    return ParseEcosystemFromPurl(purl);
                }
            }
        }

        return "unknown";
    }

    private static string ParseEcosystemFromPurl(string purl)
    {
        const string prefix = "pkg:";
        if (!purl.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
        {
            return "unknown";
        }

        var remaining = purl[prefix.Length..];
        var slashIndex = remaining.IndexOf('/');
        if (slashIndex <= 0)
        {
            return "unknown";
        }

        return remaining[..slashIndex].ToLowerInvariant();
    }

    private static string BuildPackageVersionId(string ecosystem, string packageName, string version)
    {
        return $"pkg-{NormalizeForId(ecosystem)}-{NormalizeForId(packageName)}-{NormalizeForId(version)}";
    }

    private static string NormalizeForId(string value)
    {
        var buffer = new StringBuilder(value.Length);

        foreach (var ch in value.Trim().ToLowerInvariant())
        {
            buffer.Append(char.IsLetterOrDigit(ch) ? ch : '-');
        }

        var normalized = buffer.ToString().Trim('-');
        return string.IsNullOrWhiteSpace(normalized) ? "unknown" : normalized;
    }
}
