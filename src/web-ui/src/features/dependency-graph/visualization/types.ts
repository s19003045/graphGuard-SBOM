import type { SimulationLinkDatum, SimulationNodeDatum } from "d3";
import type { GraphEdge, GraphNode } from "../types";

export type GraphSimulationNode = GraphNode & SimulationNodeDatum;

export type GraphSimulationLink = SimulationLinkDatum<GraphSimulationNode> & {
  source: string | GraphSimulationNode;
  target: string | GraphSimulationNode;
};

export type GraphCanvasProps = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedPackageVersionId?: string;
  width?: number;
  height?: number;
  onSelectNode?: (packageVersionId: string) => void;
};
