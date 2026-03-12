import { FormEvent, useState } from "react";
import { useSbomUploadStatus } from "./useSbomUploadStatus";

export function SbomUploadPage() {
  const [projectId, setProjectId] = useState("demo-project");
  const [sourceType, setSourceType] = useState("cyclonedx");
  const [snapshotId, setSnapshotId] = useState<string | null>(null);
  const status = useSbomUploadStatus(snapshotId);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await fetch("/api/v1/sbom/uploads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        sourceType,
        sbomDocument: { bomFormat: "CycloneDX", components: [] }
      })
    });

    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setSnapshotId(data.snapshotId);
  };

  return (
    <section>
      <h2>SBOM Upload</h2>
      <form onSubmit={onSubmit}>
        <label>
          Project ID
          <input value={projectId} onChange={(e) => setProjectId(e.target.value)} />
        </label>
        <label>
          Source Type
          <input value={sourceType} onChange={(e) => setSourceType(e.target.value)} />
        </label>
        <button type="submit">Upload</button>
      </form>
      {snapshotId && <p>Snapshot: {snapshotId}</p>}
      {status && <p>Status: {status}</p>}
    </section>
  );
}
