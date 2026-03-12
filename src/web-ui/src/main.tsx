import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { AppRoutes } from "./app/routes";
import { AppThemeMode, createGraphGuardTheme } from "./theme/graphGuardTheme";

function App() {
  const [themeMode, setThemeMode] = React.useState<AppThemeMode>(() => {
    const stored = localStorage.getItem("graphguard-theme-mode");
    return stored === "dark" ? "dark" : "light";
  });

  const theme = React.useMemo(() => createGraphGuardTheme(themeMode), [themeMode]);

  const toggleThemeMode = React.useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("graphguard-theme-mode", next);
      return next;
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRoutes themeMode={themeMode} onToggleThemeMode={toggleThemeMode} />
      </BrowserRouter>
    </ThemeProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
