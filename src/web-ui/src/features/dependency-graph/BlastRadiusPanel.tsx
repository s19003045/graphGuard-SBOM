import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import { exportImpactCsv, type ImpactRow } from "./exportImpactCsv";

type ImpactItem = {
  projectId: string;
  impactPath: string;
  depth: number;
  isDirect: boolean;
};

type BlastRadiusPanelProps = {
  packageVersionId: string;
  directImpacts: ImpactItem[];
  indirectImpacts: ImpactItem[];
};

export function BlastRadiusPanel({ packageVersionId, directImpacts, indirectImpacts }: BlastRadiusPanelProps) {
  const total = directImpacts.length + indirectImpacts.length;

  const onExport = () => {
    const rows: ImpactRow[] = [
      ...directImpacts.map((item) => ({
        projectId: item.projectId,
        impactPath: item.impactPath,
        depth: item.depth,
        impactType: "direct" as const
      })),
      ...indirectImpacts.map((item) => ({
        projectId: item.projectId,
        impactPath: item.impactPath,
        depth: item.depth,
        impactType: "indirect" as const
      }))
    ];

    exportImpactCsv(`impact-${packageVersionId}.csv`, rows);
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Blast Radius</Typography>
            <Button
              startIcon={<DownloadOutlinedIcon />}
              variant="outlined"
              size="small"
              onClick={onExport}
              disabled={total === 0}
            >
              Export CSV
            </Button>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Chip size="small" color="primary" label={`Direct ${directImpacts.length}`} />
            <Chip size="small" color="default" label={`Indirect ${indirectImpacts.length}`} />
            <Chip size="small" color="secondary" label={`Total ${total}`} />
          </Stack>

          {total === 0 && <Alert severity="info">No impacted projects found for this package.</Alert>}

          {directImpacts.length > 0 && (
            <>
              <Typography variant="subtitle2">Direct Impact</Typography>
              <List dense disablePadding>
                {directImpacts.map((impact) => (
                  <ListItem key={`direct-${impact.projectId}-${impact.depth}`} disableGutters>
                    <ListItemText primary={impact.projectId} secondary={impact.impactPath} />
                  </ListItem>
                ))}
              </List>
              <Divider />
            </>
          )}

          {indirectImpacts.length > 0 && (
            <>
              <Typography variant="subtitle2">Indirect Impact</Typography>
              <List dense disablePadding>
                {indirectImpacts.map((impact) => (
                  <ListItem key={`indirect-${impact.projectId}-${impact.depth}`} disableGutters>
                    <ListItemText primary={impact.projectId} secondary={impact.impactPath} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
