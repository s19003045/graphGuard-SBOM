import { useEffect, useState } from "react";

export type UploadStatus = "queued" | "processing" | "completed" | "failed";

export function useSbomUploadStatus(snapshotId: string | null) {
  const [status, setStatus] = useState<UploadStatus | null>(null);

  useEffect(() => {
    if (!snapshotId) {
      return;
    }

    let timer: number | undefined;
    const tick = async () => {
      const res = await fetch(`/api/v1/sbom/uploads/${snapshotId}`);
      if (!res.ok) {
        setStatus("failed");
        return;
      }

      const data = await res.json();
      setStatus(data.ingestStatus);

      if (data.ingestStatus === "queued" || data.ingestStatus === "processing") {
        timer = window.setTimeout(tick, 1000);
      }
    };

    tick();

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [snapshotId]);

  return status;
}
