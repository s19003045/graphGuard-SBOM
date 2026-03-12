import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import {
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
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

export function DependencyExplorerPage() {
  const { filters, setFilters, clearFilters } = useGraphFilters();

  const [isLoadingGraph, setIsLoadingGraph] = useState(false);
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedPackageVersionId, setSelectedPackageVersionId] = useState<string>("pkg-npm-ansi-regex-5.0.1");

  const [directImpacts, setDirectImpacts] = useState<ImpactItem[]>([]);
  const [indirectImpacts, setIndirectImpacts] = useState<ImpactItem[]>([]);

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
        const response = await fetch(`/api/v1/projects/sample-project/dependencies?${queryString}`, {
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
  }, [queryString]);

  useEffect(() => {
    const abort = new AbortController();

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

    if (selectedPackageVersionId) {
      loadImpact();
    }

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
            </Grid>

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {isLoadingGraph ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={18} />
                <Typography variant="body2">Loading graph...</Typography>
              </Stack>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Package</TableCell>
                      <TableCell>Version</TableCell>
                      <TableCell>Depth</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>License Risk</TableCell>
                      <TableCell>Path Type</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {nodes.map((node) => (
                      <TableRow
                        key={node.packageVersionId}
                        hover
                        selected={selectedPackageVersionId === node.packageVersionId}
                        onClick={() => setSelectedPackageVersionId(node.packageVersionId)}
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
                    {nodes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <Typography variant="body2" color="text.secondary">
                            No graph nodes available for current filter set.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Typography variant="caption" color="text.secondary">
              Edges in current graph window: {edges.length}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {isLoadingImpact ? (
        <Card>
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading blast radius...</Typography>
            </Stack>
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
