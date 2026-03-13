import AutoFixHighOutlinedIcon from "@mui/icons-material/AutoFixHighOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import { useState } from "react";

type Recommendation = {
  optionRank: number;
  summary: string;
  confidenceLevel: string;
  riskNotes: string;
};

type RemediationDialogProps = {
  findingId: string;
  projectContext?: string;
};

export function RemediationDialog({ findingId, projectContext }: RemediationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const openDialog = async () => {
    setOpen(true);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/remediation/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ findingId, projectContext })
      });

      if (!response.ok) {
        throw new Error("Failed to load recommendations");
      }

      const payload = (await response.json()) as { recommendations: Recommendation[] };
      setRecommendations(payload.recommendations ?? []);
    } catch {
      setErrorMessage("Unable to generate remediation recommendations.");
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyRecommendation = async (summary: string) => {
    await navigator.clipboard.writeText(summary);
  };

  return (
    <>
      <Button variant="contained" startIcon={<AutoFixHighOutlinedIcon />} onClick={openDialog}>
        View Remediation Options
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Remediation Recommendations</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Finding: {findingId}
            </Typography>

            {isLoading && <Typography variant="body2">Generating recommendations...</Typography>}

            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            {!isLoading && !errorMessage && recommendations.length === 0 && (
              <Alert severity="info">No remediation options available for this finding.</Alert>
            )}

            {recommendations.length > 0 && (
              <List disablePadding>
                {recommendations.map((option, index) => (
                  <Stack key={`${option.optionRank}-${index}`} spacing={1} sx={{ py: 1 }}>
                    <ListItem disableGutters secondaryAction={<Button size="small" startIcon={<ContentCopyOutlinedIcon />} onClick={() => copyRecommendation(option.summary)}>Copy</Button>}>
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="subtitle2">Option {option.optionRank}</Typography>
                            <Chip size="small" label={option.confidenceLevel} />
                          </Stack>
                        }
                        secondary={
                          <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                            <Typography variant="body2">{option.summary}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {option.riskNotes}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                    {index < recommendations.length - 1 && <Divider />}
                  </Stack>
                ))}
              </List>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
