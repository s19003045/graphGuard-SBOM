import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { FormEvent, useState } from "react";

type QueryEvidence = {
  sourceType: string;
  sourceId: string;
  snippet: string;
};

type QueryResponse = {
  answerSummary: string;
  evidence: QueryEvidence[];
  queryMetadata: {
    queryEngine: string;
    queryText?: string;
  };
};

export function NaturalLanguageQueryWidget() {
  const [question, setQuestion] = useState("哪些專案還在使用舊版的 lodash?");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<QueryResponse | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/v1/query/natural-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      if (!response.ok) {
        throw new Error("query failed");
      }

      const payload = (await response.json()) as QueryResponse;
      setResult(payload);
    } catch {
      setErrorMessage("Unable to process natural language query.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">Explainable Security Query</Typography>

          <form onSubmit={onSubmit}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                fullWidth
                label="Ask a security question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
              <Button type="submit" variant="contained" startIcon={<SendOutlinedIcon />} disabled={isLoading}>
                Ask
              </Button>
            </Stack>
          </form>

          {isLoading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Analyzing question...</Typography>
            </Stack>
          )}

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {result && (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Answer</Typography>
              <Typography variant="body2">{result.answerSummary}</Typography>
              <Typography variant="caption" color="text.secondary">
                Engine: {result.queryMetadata.queryEngine}
              </Typography>
              {result.queryMetadata.queryText && (
                <Typography variant="caption" color="text.secondary">
                  Query: {result.queryMetadata.queryText}
                </Typography>
              )}

              <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
                Evidence
              </Typography>
              <List dense disablePadding>
                {result.evidence.map((item, index) => (
                  <ListItem key={`${item.sourceId}-${index}`} disableGutters>
                    <ListItemText
                      primary={`${item.sourceType} | ${item.sourceId}`}
                      secondary={item.snippet}
                    />
                  </ListItem>
                ))}
              </List>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
