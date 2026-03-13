import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type GraphSeverity = "critical" | "high" | "medium" | "low";
type LicenseRisk = "high" | "medium" | "low";

export type GraphFilters = {
  projectId: string;
  maxDepth: number;
  severityFilter?: GraphSeverity;
  licenseRiskFilter?: LicenseRisk;
};

const DEFAULT_MAX_DEPTH = 3;
const DEFAULT_PROJECT_ID = "demo-project";

export function useGraphFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo<GraphFilters>(() => {
    const maxDepthRaw = Number(searchParams.get("maxDepth") ?? DEFAULT_MAX_DEPTH);
    const maxDepth = Number.isFinite(maxDepthRaw) ? Math.min(Math.max(maxDepthRaw, 1), 5) : DEFAULT_MAX_DEPTH;

    const severityRaw = searchParams.get("severityFilter") ?? undefined;
    const licenseRaw = searchParams.get("licenseRiskFilter") ?? undefined;

    return {
      projectId: searchParams.get("projectId") || DEFAULT_PROJECT_ID,
      maxDepth,
      severityFilter: toSeverity(severityRaw),
      licenseRiskFilter: toLicenseRisk(licenseRaw)
    };
  }, [searchParams]);

  const setFilters = (next: Partial<GraphFilters>) => {
    const merged: GraphFilters = {
      ...filters,
      ...next
    };

    const nextParams = new URLSearchParams();
    nextParams.set("projectId", merged.projectId);
    nextParams.set("maxDepth", String(merged.maxDepth));

    if (merged.severityFilter) {
      nextParams.set("severityFilter", merged.severityFilter);
    }

    if (merged.licenseRiskFilter) {
      nextParams.set("licenseRiskFilter", merged.licenseRiskFilter);
    }

    setSearchParams(nextParams, { replace: true });
  };

  const clearFilters = () => {
    setSearchParams(
      new URLSearchParams([
        ["projectId", filters.projectId],
        ["maxDepth", String(DEFAULT_MAX_DEPTH)]
      ]),
      { replace: true }
    );
  };

  return { filters, setFilters, clearFilters };
}

function toSeverity(value: string | undefined): GraphSeverity | undefined {
  if (value === "critical" || value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return undefined;
}

function toLicenseRisk(value: string | undefined): LicenseRisk | undefined {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return undefined;
}
