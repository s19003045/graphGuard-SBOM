import { Alert, CircularProgress, Stack, Typography } from "@mui/material";

type AsyncStateProps = {
  isLoading: boolean;
  errorMessage?: string | null;
  isEmpty?: boolean;
  loadingText?: string;
  emptyText?: string;
};

export function AsyncState({
  isLoading,
  errorMessage,
  isEmpty,
  loadingText = "Loading...",
  emptyText = "No data available."
}: AsyncStateProps) {
  if (isLoading) {
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <CircularProgress size={18} />
        <Typography variant="body2">{loadingText}</Typography>
      </Stack>
    );
  }

  if (errorMessage) {
    return <Alert severity="error">{errorMessage}</Alert>;
  }

  if (isEmpty) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyText}
      </Typography>
    );
  }

  return null;
}
