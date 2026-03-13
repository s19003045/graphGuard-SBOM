import { ChangeEvent, FormEvent, useState } from "react";
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
import { useSearchParams } from "react-router-dom";
import { useSbomUploadStatus } from "./useSbomUploadStatus";

export function SbomUploadPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projectId, setProjectId] = useState("demo-project");
  const [sourceType, setSourceType] = useState("cyclonedx");
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const [sbomFile, setSbomFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const status = useSbomUploadStatus(snapshotId);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSnapshotId(null);
    setIsSubmitting(true);
    setErrorMessage(null);

    if (!sbomFile) {
      setErrorMessage("Please select an SBOM .json file before uploading.");
      setIsSubmitting(false);
      return;
    }

    try {
      const fileContent = await sbomFile.text();
      const parsedDocument = JSON.parse(fileContent);

      const response = await fetch("/api/v1/sbom/uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          sourceType,
          sbomDocument: parsedDocument
        })
      });

      if (!response.ok) {
        setErrorMessage("Upload failed. Please verify API availability and request payload.");
        return;
      }

      const data = await response.json();
      setSnapshotId(data.snapshotId);

      const nextParams = new URLSearchParams();
      nextParams.set("projectId", projectId);
      nextParams.set("maxDepth", searchParams.get("maxDepth") || "3");
      setSearchParams(nextParams, { replace: true });
    } catch {
      setErrorMessage("Upload failed. Ensure the selected file is valid JSON and API is reachable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSbomFile(file);
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
                <Button component="label" variant="outlined" fullWidth sx={{ height: "100%" }}>
                  {sbomFile ? "Change SBOM File" : "Select SBOM File"}
                  <input type="file" accept=".json,application/json" hidden onChange={onFileChange} />
                </Button>
              </Grid>
              <Grid item xs={12} md={12}>
                <Typography variant="body2" color="text.secondary">
                  {sbomFile ? `Selected file: ${sbomFile.name}` : "No SBOM file selected"}
                </Typography>
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
