export type GraphNode = {
  packageVersionId: string;
  ecosystem: string;
  packageName: string;
  version: string;
  depth: number;
  isDirect: boolean;
  severity?: string;
  licenseRisk?: string;
};

export type GraphEdge = {
  fromPackageVersionId: string;
  toPackageVersionId: string;
  depth: number;
  isDirect: boolean;
};

export type ImpactItem = {
  projectId: string;
  impactPath: string;
  depth: number;
  isDirect: boolean;
};
