import {
  Alert,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { FormEvent, useState } from "react";

export function RiskExceptionForm() {
  const [findingId, setFindingId] = useState("finding-abc");
  const [owner, setOwner] = useState("security-admin");
  const [reason, setReason] = useState("temporarily accepted risk");
  const [expiresAt, setExpiresAt] = useState("2026-12-31T00:00");
  const [riskExceptionId, setRiskExceptionId] = useState<string | null>(null);
  const [state, setState] = useState("revoked");
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onCreate = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/v1/vulnerabilities/${encodeURIComponent(findingId)}/exceptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, owner, expiresAt: new Date(expiresAt).toISOString() })
      });

      if (!response.ok) {
        throw new Error("create failed");
      }

      const payload = (await response.json()) as { riskExceptionId: string; state: string };
      setRiskExceptionId(payload.riskExceptionId);
      setMessage(`Created exception ${payload.riskExceptionId} (${payload.state}).`);
    } catch {
      setErrorMessage("Unable to create risk exception.");
    }
  };

  const onUpdate = async () => {
    if (!riskExceptionId) {
      setErrorMessage("Create an exception first before updating state.");
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch(
        `/api/v1/vulnerabilities/${encodeURIComponent(findingId)}/exceptions/${encodeURIComponent(riskExceptionId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state, reason })
        }
      );

      if (!response.ok) {
        throw new Error("update failed");
      }

      const payload = (await response.json()) as { state: string };
      setMessage(`Updated exception state to ${payload.state}.`);
    } catch {
      setErrorMessage("Unable to update risk exception state.");
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="h6">Risk Exception Management</Typography>

          <form onSubmit={onCreate}>
            <Stack spacing={1.5}>
              <TextField label="Finding ID" value={findingId} onChange={(e) => setFindingId(e.target.value)} fullWidth required />
              <TextField label="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} fullWidth required />
              <TextField label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth required multiline minRows={2} />
              <TextField
                label="Expires At"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              <Button type="submit" variant="contained">Create Exception</Button>
            </Stack>
          </form>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField
              select
              label="Next State"
              value={state}
              onChange={(e) => setState(e.target.value)}
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="active">active</MenuItem>
              <MenuItem value="revoked">revoked</MenuItem>
              <MenuItem value="expired">expired</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={onUpdate}>Update State</Button>
          </Stack>

          {message && <Alert severity="success">{message}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
        </Stack>
      </CardContent>
    </Card>
  );
}
