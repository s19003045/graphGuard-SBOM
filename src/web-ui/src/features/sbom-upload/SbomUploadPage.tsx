import { FormEvent, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useSbomUploadStatus } from "./useSbomUploadStatus";

export function SbomUploadPage() {
  const [projectId, setProjectId] = useState("demo-project");
  const [sourceType, setSourceType] = useState("cyclonedx");
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const status = useSbomUploadStatus(snapshotId);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/sbom/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          sourceType,
          sbomDocument: { bomFormat: "CycloneDX", components: [] }
        })
      });

      if (!response.ok) {
        setErrorMessage("Upload failed. Please verify API availability and request payload.");
        return;
      }

      const data = await response.json();
      setSnapshotId(data.snapshotId);
    } catch {
      setErrorMessage("Network error while uploading SBOM.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColor =
    status === "completed" ? "success" : status === "failed" ? "error" : status === "processing" ? "warning" : "default";

  return (
    <Card>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
            <Typography variant="h6">SBOM Ingestion</Typography>
            {snapshotId && <Chip size="small" label={`Snapshot ${snapshotId.slice(0, 8)}...`} />}
          </Stack>

          <Typography color="text.secondary" variant="body2">
            Upload a CycloneDX or SPDX document to start asynchronous dependency analysis.
          </Typography>

          <form onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={5}>
                <TextField
                  label="Project ID"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  label="Source Type"
                  select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="cyclonedx">CycloneDX</MenuItem>
                  <MenuItem value="spdx">SPDX</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <Button type="submit" variant="contained" fullWidth disabled={isSubmitting} sx={{ height: "100%" }}>
                  {isSubmitting ? "Submitting..." : "Upload SBOM"}
                </Button>
              </Grid>
            </Grid>
          </form>

          {isSubmitting && <LinearProgress />}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {status && (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                Current status
              </Typography>
              <Chip size="small" color={statusColor} label={status.toUpperCase()} />
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
