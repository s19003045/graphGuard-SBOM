import { useEffect, useMemo, useRef } from "react";
import { select, forceCenter, forceLink, forceManyBody, forceSimulation, drag, zoom } from "d3";
import { GRAPH_CANVAS_COLORS, GRAPH_CANVAS_DEFAULT_HEIGHT, GRAPH_CANVAS_DEFAULT_WIDTH } from "./visualization/constants";
import type { GraphCanvasProps, GraphSimulationLink, GraphSimulationNode } from "./visualization/types";

export function DependencyGraphCanvas({
  nodes,
  edges,
  selectedPackageVersionId,
  width = GRAPH_CANVAS_DEFAULT_WIDTH,
  height = GRAPH_CANVAS_DEFAULT_HEIGHT,
  onSelectNode
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const graphNodes = useMemo<GraphSimulationNode[]>(() => nodes.map((node) => ({ ...node })), [nodes]);

  const nodeIdSet = useMemo(() => new Set(graphNodes.map((node) => node.packageVersionId)), [graphNodes]);

  const graphLinks = useMemo<GraphSimulationLink[]>(
    () =>
      edges.map((edge) => ({
        source: edge.fromPackageVersionId,
        target: edge.toPackageVersionId
      }))
      .filter((edge) => nodeIdSet.has(String(edge.source)) && nodeIdSet.has(String(edge.target))),
    [edges, nodeIdSet]
  );

  useEffect(() => {
    const svgElement = svgRef.current;
    if (!svgElement) {
      return;
    }

    const svg = select(svgElement);
    svg.selectAll("*").remove();

    if (graphNodes.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", GRAPH_CANVAS_COLORS.label)
        .style("font-size", "12px")
        .text("No dependency graph data available");
      return;
    }

    const graphLayer = svg.append("g");

    const link = graphLayer
      .append("g")
      .attr("stroke-opacity", 0.55)
      .selectAll("line")
      .data(graphLinks)
      .join("line")
      .attr("stroke", (d) => isConnectedToSelected(d, selectedPackageVersionId) ? GRAPH_CANVAS_COLORS.selected : GRAPH_CANVAS_COLORS.link)
      .attr("stroke-width", 1.4);

    const node = graphLayer
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .selectAll("circle")
      .data(graphNodes)
      .join("circle")
      .attr("r", 6)
      .attr("fill", (d) => (d.packageVersionId === selectedPackageVersionId ? GRAPH_CANVAS_COLORS.selected : GRAPH_CANVAS_COLORS.node))
      .style("cursor", "pointer")
      .on("click", (_, datum) => {
        onSelectNode?.(datum.packageVersionId);
      });

    const simulation = forceSimulation(graphNodes)
      .force("link", forceLink(graphLinks).id((d) => d.packageVersionId).distance(58))
      .force("charge", forceManyBody().strength(-120))
      .force("center", forceCenter(width / 2, height / 2))
      .on("tick", () => {
        link
          .attr("x1", (d) => (d.source as GraphSimulationNode).x ?? 0)
          .attr("y1", (d) => (d.source as GraphSimulationNode).y ?? 0)
          .attr("x2", (d) => (d.target as GraphSimulationNode).x ?? 0)
          .attr("y2", (d) => (d.target as GraphSimulationNode).y ?? 0);

        node.attr("cx", (d) => d.x ?? 0).attr("cy", (d) => d.y ?? 0);
      });

    const dragBehavior = drag<SVGCircleElement, GraphSimulationNode>()
      .on("start", (event, datum) => {
        if (!event.active) {
          simulation.alphaTarget(0.2).restart();
        }
        datum.fx = datum.x;
        datum.fy = datum.y;
      })
      .on("drag", (event, datum) => {
        datum.fx = event.x;
        datum.fy = event.y;
      })
      .on("end", (event, datum) => {
        if (!event.active) {
          simulation.alphaTarget(0);
        }
        datum.fx = null;
        datum.fy = null;
      });

    node.call(dragBehavior);

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3.5])
      .on("zoom", (event) => {
        graphLayer.attr("transform", String(event.transform));
      });

    svg.call(zoomBehavior);

    return () => {
      svg.on(".zoom", null);
      simulation.stop();
    };
  }, [graphNodes, graphLinks, width, height, selectedPackageVersionId, onSelectNode]);

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Dependency graph visualization canvas"
      style={{ border: "1px solid rgba(0, 0, 0, 0.12)", borderRadius: 8, backgroundColor: "#ffffff" }}
    />
  );
}

function isConnectedToSelected(link: GraphSimulationLink, selectedPackageVersionId?: string) {
  if (!selectedPackageVersionId) {
    return false;
  }

  const sourceId = typeof link.source === "string" ? link.source : link.source.packageVersionId;
  const targetId = typeof link.target === "string" ? link.target : link.target.packageVersionId;
  return sourceId === selectedPackageVersionId || targetId === selectedPackageVersionId;
}
