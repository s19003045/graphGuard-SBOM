import { Navigate, Route, Routes } from "react-router-dom";
import { RiskSummaryCards } from "../features/dashboard/RiskSummaryCards";
import { SbomUploadPage } from "../features/sbom-upload/SbomUploadPage";

function ProtectedLayout() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <h1>GraphGuard</h1>
      <RiskSummaryCards />
      <SbomUploadPage />
    </main>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedLayout />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
