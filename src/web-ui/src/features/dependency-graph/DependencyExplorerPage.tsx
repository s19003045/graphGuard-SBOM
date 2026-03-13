import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  TextField,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TablePagination,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { buildPackageRowA11yLabel, getInteractiveRowA11yProps } from "../../shared/accessibility/a11yEnhancements";
import { AsyncState } from "../../shared/ui/AsyncState";
import { BlastRadiusPanel } from "./BlastRadiusPanel";
import { useGraphFilters } from "./useGraphFilters";

type GraphNode = {
  packageVersionId: string;
  ecosystem: string;
  packageName: string;
  version: string;
  depth: number;
  isDirect: boolean;
  severity?: string;
  licenseRisk?: string;
};

type GraphEdge = {
  fromPackageVersionId: string;
  toPackageVersionId: string;
  depth: number;
  isDirect: boolean;
};

type ImpactItem = {
  projectId: string;
  impactPath: string;
  depth: number;
  isDirect: boolean;
};

type SortKey = "packageName" | "version" | "depth";
type SortDirection = "asc" | "desc";

export function DependencyExplorerPage() {
  const { filters, setFilters, clearFilters } = useGraphFilters();

  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedPackageVersionId, setSelectedPackageVersionId] = useState<string>("pkg-npm-ansi-regex-5.0.1");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("depth");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [directImpacts, setDirectImpacts] = useState<ImpactItem[]>([]);
  const [indirectImpacts, setIndirectImpacts] = useState<ImpactItem[]>([]);

  const visibleNodes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    const filtered = keyword
      ? nodes.filter(
          (node) =>
            node.packageName.toLowerCase().includes(keyword)
            || node.version.toLowerCase().includes(keyword)
            || node.packageVersionId.toLowerCase().includes(keyword)
        )
      : nodes;

    const sorted = [...filtered].sort((left, right) => {
      if (sortBy === "depth") {
        return left.depth - right.depth;
      }

      if (sortBy === "version") {
        return left.version.localeCompare(right.version, undefined, { numeric: true, sensitivity: "base" });
      }

      return left.packageName.localeCompare(right.packageName, undefined, { sensitivity: "base" });
    });

    return sortDirection === "asc" ? sorted : sorted.reverse();
  }, [nodes, searchTerm, sortBy, sortDirection]);

  const pagedNodes = useMemo(
    () => visibleNodes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [visibleNodes, page, rowsPerPage]
  );

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    params.set("maxDepth", String(filters.maxDepth));

    if (filters.severityFilter) {
      params.set("severityFilter", filters.severityFilter);
    }

    if (filters.licenseRiskFilter) {
      params.set("licenseRiskFilter", filters.licenseRiskFilter);
    }

    return params.toString();
  }, [filters]);

  useEffect(() => {
    const abort = new AbortController();

    async function loadGraph() {
      setIsLoadingGraph(true);
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/v1/projects/${encodeURIComponent(filters.projectId)}/dependencies?${queryString}`, {
          signal: abort.signal
        });

        if (!response.ok) {
          throw new Error("Failed to load dependency graph");
        }

        const payload = (await response.json()) as {
          nodes: GraphNode[];
          edges: GraphEdge[];
        };

        setNodes(payload.nodes ?? []);
        setEdges(payload.edges ?? []);
      } catch {
        if (!abort.signal.aborted) {
          setErrorMessage("Unable to load dependency graph. Please check API service availability.");
        }
      } finally {
        if (!abort.signal.aborted) {
          setIsLoadingGraph(false);
        }
      }
    }

    loadGraph();
    return () => abort.abort();
  }, [filters.projectId, queryString]);

  useEffect(() => {
    if (visibleNodes.length === 0) {
      setSelectedPackageVersionId("");
      return;
    }

    const exists = visibleNodes.some((node) => node.packageVersionId === selectedPackageVersionId);
    if (!exists) {
      setSelectedPackageVersionId(visibleNodes[0].packageVersionId);
    }
  }, [visibleNodes, selectedPackageVersionId]);

  useEffect(() => {
    setPage(0);
  }, [filters.projectId, filters.maxDepth, filters.severityFilter, filters.licenseRiskFilter, searchTerm, sortBy, sortDirection]);

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(visibleNodes.length / rowsPerPage) - 1);
    if (page > maxPage) {
      setPage(maxPage);
    }
  }, [page, rowsPerPage, visibleNodes]);

  useEffect(() => {
    const abort = new AbortController();

    if (!selectedPackageVersionId) {
      setDirectImpacts([]);
      setIndirectImpacts([]);
      setIsLoadingImpact(false);
      return () => abort.abort();
    }

    async function loadImpact() {
      setIsLoadingImpact(true);

      try {
        const response = await fetch(`/api/v1/packages/${selectedPackageVersionId}/impact`, {
          signal: abort.signal
        });

        if (!response.ok) {
          throw new Error("Failed to load package impact");
        }

        const payload = (await response.json()) as {
          directImpacts: ImpactItem[];
          indirectImpacts: ImpactItem[];
        };

        setDirectImpacts(payload.directImpacts ?? []);
        setIndirectImpacts(payload.indirectImpacts ?? []);
      } catch {
        if (!abort.signal.aborted) {
          setErrorMessage("Unable to load blast radius information for selected package.");
        }
      } finally {
        if (!abort.signal.aborted) {
          setIsLoadingImpact(false);
        }
      }
    }

    loadImpact();

    return () => abort.abort();
  }, [selectedPackageVersionId]);

  return (
    <Stack spacing={2}>
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1} alignItems="center">
                <HubOutlinedIcon color="primary" />
                <Typography variant="h6">Dependency Explorer</Typography>
              </Stack>
              <IconButton onClick={clearFilters} color="primary" aria-label="reset graph filters">
                <RefreshOutlinedIcon />
              </IconButton>
            </Stack>

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Project ID"
                  value={filters.projectId}
                  onChange={(e) => setFilters({ projectId: e.target.value || "demo-project" })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="max-depth-label">Max Depth</InputLabel>
                  <Select
                    labelId="max-depth-label"
                    label="Max Depth"
                    value={String(filters.maxDepth)}
                    onChange={(e) => setFilters({ maxDepth: Number(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map((depth) => (
                      <MenuItem key={depth} value={String(depth)}>
                        {depth}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="severity-filter-label">Severity</InputLabel>
                  <Select
                    labelId="severity-filter-label"
                    label="Severity"
                    value={filters.severityFilter ?? ""}
                    onChange={(e) => setFilters({ severityFilter: (e.target.value || undefined) as GraphNode["severity"] })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="critical">Critical</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="license-risk-filter-label">License Risk</InputLabel>
                  <Select
                    labelId="license-risk-filter-label"
                    label="License Risk"
                    value={filters.licenseRiskFilter ?? ""}
                    onChange={(e) => setFilters({ licenseRiskFilter: (e.target.value || undefined) as GraphNode["licenseRisk"] })}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField
                  label="Search Package"
                  placeholder="Search by package name, version, or ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            {errorMessage && <AsyncState isLoading={false} errorMessage={errorMessage} />}

            {isLoadingGraph ? (
              <AsyncState isLoading loadingText="Loading graph..." />
            ) : (
              <TableContainer sx={{ maxHeight: 420 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === "packageName"}
                          direction={sortBy === "packageName" ? sortDirection : "asc"}
                          onClick={() => {
                            if (sortBy === "packageName") {
                              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                              return;
                            }

                            setSortBy("packageName");
                            setSortDirection("asc");
                          }}
                        >
                          Package
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === "version"}
                          direction={sortBy === "version" ? sortDirection : "asc"}
                          onClick={() => {
                            if (sortBy === "version") {
                              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                              return;
                            }

                            setSortBy("version");
                            setSortDirection("asc");
                          }}
                        >
                          Version
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={sortBy === "depth"}
                          direction={sortBy === "depth" ? sortDirection : "asc"}
                          onClick={() => {
                            if (sortBy === "depth") {
                              setSortDirection(sortDirection === "asc" ? "desc" : "asc");
                              return;
                            }

                            setSortBy("depth");
                            setSortDirection("asc");
                          }}
                        >
                          Depth
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>License Risk</TableCell>
                      <TableCell>Path Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedNodes.map((node) => (
                      <TableRow
                        key={node.packageVersionId}
                        hover
                        selected={selectedPackageVersionId === node.packageVersionId}
                        onClick={() => setSelectedPackageVersionId(node.packageVersionId)}
                        {...getInteractiveRowA11yProps({
                          selected: selectedPackageVersionId === node.packageVersionId,
                          label: buildPackageRowA11yLabel(node.packageName, node.version, node.isDirect),
                          onActivate: () => setSelectedPackageVersionId(node.packageVersionId)
                        })}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>{node.packageName}</TableCell>
                        <TableCell>{node.version}</TableCell>
                        <TableCell>{node.depth}</TableCell>
                        <TableCell>
                          {node.severity ? <Chip size="small" label={node.severity} color="warning" /> : "-"}
                        </TableCell>
                        <TableCell>{node.licenseRisk ?? "-"}</TableCell>
                        <TableCell>{node.isDirect ? "Direct" : "Indirect"}</TableCell>
                      </TableRow>
                    ))}
                    {visibleNodes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography variant="body2" color="text.secondary">
                            No graph nodes available for current filter/search set.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {visibleNodes.length > 0 && (
              <TablePagination
                component="div"
                count={visibleNodes.length}
                page={page}
                onPageChange={(_, nextPage) => setPage(nextPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(Number(event.target.value));
                  setPage(0);
                }}
                rowsPerPageOptions={[25, 50, 100]}
              />
            )}

            <Typography variant="caption" color="text.secondary">
              Nodes in current graph window: {visibleNodes.length} (filtered from {nodes.length}) | Edges in current graph window: {edges.length}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {isLoadingImpact ? (
        <Card>
          <CardContent>
            <AsyncState isLoading loadingText="Loading blast radius..." />
          </CardContent>
        </Card>
      ) : (
        <BlastRadiusPanel
          packageVersionId={selectedPackageVersionId}
          directImpacts={directImpacts}
          indirectImpacts={indirectImpacts}
        />
      )}
    </Stack>
  );
}
