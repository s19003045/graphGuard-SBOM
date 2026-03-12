export type ImpactRow = {
  projectId: string;
  impactPath: string;
  depth: number;
  impactType: "direct" | "indirect";
};

export function exportImpactCsv(fileName: string, rows: ImpactRow[]) {
  const header = "projectId,impactPath,depth,impactType";
  const body = rows
    .map((row) => [row.projectId, row.impactPath, String(row.depth), row.impactType].map(escapeCsv).join(","))
    .join("\n");

  const csv = `${header}\n${body}`;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes("\n") || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}
