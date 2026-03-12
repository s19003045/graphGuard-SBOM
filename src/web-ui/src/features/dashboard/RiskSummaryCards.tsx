import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import { riskSeverity } from "../../theme/graphGuardTheme";

export function RiskSummaryCards() {
  const cards = [
    {
      title: "Threatened Projects",
      value: 0,
      hint: "No active project exposure",
      icon: <ShieldOutlinedIcon sx={{ color: riskSeverity.low }} />,
      accent: riskSeverity.low
    },
    {
      title: "Open CVEs",
      value: 0,
      hint: "No unresolved vulnerabilities",
      icon: <BugReportOutlinedIcon sx={{ color: riskSeverity.medium }} />,
      accent: riskSeverity.medium
    },
    {
      title: "High-Risk Licenses",
      value: 0,
      hint: "No blocked license findings",
      icon: <GavelOutlinedIcon sx={{ color: riskSeverity.high }} />,
      accent: riskSeverity.high
    }
  ];

  return (
    <Grid container spacing={2}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={4} key={card.title}>
          <Card sx={{ borderTop: `3px solid ${card.accent}` }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2" color="text.secondary">
                  {card.title}
                </Typography>
                {card.icon}
              </Stack>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {card.hint}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
