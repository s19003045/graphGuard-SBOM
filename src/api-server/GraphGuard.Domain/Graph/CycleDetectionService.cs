namespace GraphGuard.Domain.Graph;

public sealed class CycleDetectionService
{
    public bool HasCycle(IEnumerable<DependencyEdge> edges)
    {
        var adjacency = edges
            .GroupBy(edge => edge.FromPackageVersionId)
            .ToDictionary(group => group.Key, group => group.Select(edge => edge.ToPackageVersionId).ToArray(), StringComparer.Ordinal);

        var state = new Dictionary<string, int>(StringComparer.Ordinal);

        foreach (var node in adjacency.Keys)
        {
            if (Visit(node, adjacency, state))
            {
                return true;
            }
        }

        return false;
    }

    private static bool Visit(
        string node,
        IReadOnlyDictionary<string, string[]> adjacency,
        IDictionary<string, int> state)
    {
        if (state.TryGetValue(node, out var currentState))
        {
            return currentState == 1;
        }

        state[node] = 1;

        if (adjacency.TryGetValue(node, out var neighbors))
        {
            foreach (var neighbor in neighbors)
            {
                if (Visit(neighbor, adjacency, state))
                {
                    return true;
                }
            }
        }

        state[node] = 2;
        return false;
    }
}
