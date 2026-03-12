import { createTheme } from "@mui/material/styles";

export type AppThemeMode = "light" | "dark";

export const riskSeverity = {
  critical: "#B3261E",
  high: "#D65A00",
  medium: "#C77800",
  low: "#2E7D32"
} as const;

export function createGraphGuardTheme(mode: AppThemeMode) {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? "#3BB7B7" : "#0B6E6E"
      },
      secondary: {
        main: isDark ? "#E08A61" : "#C25F2D"
      },
      background: {
        default: isDark ? "#0B1114" : "#F3F7F8",
        paper: isDark ? "#111B21" : "#FFFFFF"
      },
      success: {
        main: riskSeverity.low
      },
      warning: {
        main: riskSeverity.medium
      },
      error: {
        main: riskSeverity.critical
      }
    },
    shape: {
      borderRadius: 12
    },
    typography: {
      fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      h4: {
        fontWeight: 700,
        letterSpacing: -0.4
      },
      h6: {
        fontWeight: 600
      }
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            border: isDark ? "1px solid #22303A" : "1px solid #E0EAED",
            boxShadow: isDark ? "0 8px 20px rgba(0, 0, 0, 0.28)" : "0 8px 20px rgba(10, 45, 61, 0.08)"
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 600
          }
        }
      }
    }
  });
}