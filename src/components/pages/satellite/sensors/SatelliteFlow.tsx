import { useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  MarkerType,
  Position,
  Node,
  Edge,
} from "react-flow-renderer";

import BaseNode, { BaseNodeData } from "./BaseNode";
import satelliteData from "./sateliteStates.json";
import telemetryData from "./telemetry.json";
import modeData from "./currentMode.json";
import "./SatelliteFlow.css";

interface Telemetry {
  [key: string]: string;
}

interface ComponentType {
  id: string;
  label: string;
  type: string;
  position?: { x: number; y: number };
  info?: string;
  expected?: Record<string, { state: string }>;
}

/* Copia valores de auxiliares (_aux, _aux2...) */
const resolveAuxTelemetry = (telemetry: Telemetry): Telemetry => {
  const resolvedTelemetry: Telemetry = { ...telemetry };
  Object.keys(telemetry).forEach((key) => {
    const auxMatch = key.match(/(.*)(_aux\d*|_aux)$/);
    if (auxMatch) {
      const originalKey = auxMatch[1];
      if (telemetry[originalKey] !== undefined) {
        resolvedTelemetry[key] = telemetry[originalKey];
      }
    }
  });
  return resolvedTelemetry;
};

/** Colores de estados */
const NODE_COLORS: Record<string, string> = {
  working: "#4caf50",
  notWorking: "#f44336",
  off: "#9e9e9e",
  unknown: "#9e9e9e",
};

/** Convierte estado a etiqueta legible */
const formatStateLabel = (state?: string) => {
  switch (state) {
    case "notWorking":
      return "Not working";
    case "working":
      return "Working";
    case "off":
      return "Off";
    case "unknown":
    default:
      return "Unknown";
  }
};

/** Color de nodo */
const getNodeColor = (
  component: ComponentType,
  telemetry: Telemetry
): string => {
  const state = telemetry[component.id] ?? "unknown";
  return NODE_COLORS[state] ?? NODE_COLORS.unknown;
};

/** Tooltip flotante */
const PortalTooltip = ({
  x,
  y,
  label,
  expectedStateLabel,
  expectedStateColor,
  currentStateLabel,
  currentStateColor,
  onClose,
}: {
  x: number;
  y: number;
  label: string;
  expectedStateLabel: string;
  expectedStateColor: string;
  currentStateLabel: string;
  currentStateColor: string;
  onClose: () => void;
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="node-tooltip"
      style={{
        position: "fixed",
        top: y + 12,
        left: x + 12,
        backgroundColor: "#333",
        color: "white",
        padding: "10px 14px",
        borderRadius: "8px",
        boxShadow: "0px 2px 10px rgba(0,0,0,0.4)",
        fontSize: "0.9rem",
        zIndex: 1000,
        maxWidth: "220px",
      }}
    >
      <strong>{label}</strong>
      <div style={{ marginTop: "6px" }}>
        <div>
          <strong>Expected state:</strong>{" "}
          <span style={{ color: expectedStateColor }}>
            {expectedStateLabel}
          </span>
        </div>
        <div>
          <strong>Current state:</strong>{" "}
          <span style={{ color: currentStateColor }}>{currentStateLabel}</span>
        </div>
      </div>
    </div>
  );
};

const SatelliteFlow = (): JSX.Element => {
  const [telemetry] = useState<Telemetry>(() =>
    resolveAuxTelemetry(telemetryData)
  );

  const [mode] = useState(() => modeData?.mode ?? "UNKNOWN");
  const [selectedNode, setSelectedNode] = useState<{
    id: string;
    data: BaseNodeData & {
      expectedStateRaw?: string;
      currentStateRaw?: string;
      expectedStateLabel?: string;
      currentStateLabel?: string;
    };
    x: number;
    y: number;
  } | null>(null);

  /** Crear nodos */
  const nodes: Node<BaseNodeData>[] = useMemo(() => {
    const nodeTypeMap: Record<string, { source: Position; target: Position }> =
      {
        br: { source: Position.Bottom, target: Position.Right },
        rt: { source: Position.Right, target: Position.Top },
        tt: { source: Position.Top, target: Position.Top },
        bt: { source: Position.Bottom, target: Position.Top },
        tb: { source: Position.Top, target: Position.Bottom },
        rr: { source: Position.Right, target: Position.Right },
        bb: { source: Position.Bottom, target: Position.Bottom },
        rl: { source: Position.Right, target: Position.Left },
        default: { source: Position.Right, target: Position.Left },
      };

    return (satelliteData.components as ComponentType[]).map(
      (component, index) => {
        const nodeConfig = nodeTypeMap[component.type] || nodeTypeMap.default;
        const currentStateRaw = telemetry[component.id] ?? "unknown";
        const expectedStateRaw = component.expected?.[mode]?.state ?? "unknown";

        return {
          id: component.id,
          type: "base",
          data: {
            label: component.label,
            color: getNodeColor(component, telemetry),
            info: component.info,
            expectedStateRaw,
            currentStateRaw,
            expectedStateLabel: formatStateLabel(expectedStateRaw),
            currentStateLabel: formatStateLabel(currentStateRaw),
          },
          position: component.position ?? { x: 150 * index, y: 50 },
          sourcePosition: nodeConfig.source,
          targetPosition: nodeConfig.target,
        };
      }
    );
  }, [telemetry, mode]);

  /** Crear edges */
  const edges: Edge[] = useMemo(() => {
    return satelliteData.connections.map((conn: any) => {
      const sourceNode = nodes.find((node) => node.id === conn.from);
      const sourceColor = sourceNode?.data?.color ?? "white";

      return {
        id: `${conn.from}-${conn.to}`,
        source: conn.from,
        target: conn.to,
        type: "step",
        markerEnd: { type: MarkerType.ArrowClosed, color: sourceColor },
        style: { strokeWidth: 2, stroke: sourceColor },
      };
    });
  }, [nodes]);

  /** Manejar clic en nodo */
  const handleNodeClick = (
    event: React.MouseEvent,
    node: Node<BaseNodeData>
  ) => {
    event.stopPropagation();
    setSelectedNode({
      id: node.id,
      data: node.data as any,
      x: event.clientX,
      y: event.clientY,
    });
  };

  // Cerrar tooltip al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setSelectedNode(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);
  return (
    <div className="satellite-flow-container">
      <div className="satellite-flow-controls">
        <h2>Current Mode: {mode}</h2>
      </div>

      <div
        className="satellite-flow"
        style={{ position: "relative", overflow: "visible" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={{ base: BaseNode }}
          fitView
          onNodeClick={handleNodeClick}
          onPaneClick={() => setSelectedNode(null)}
        >
          <Background
            color="#9e9e9e"
            gap={18}
            variant={"dots" as any}
            style={{ backgroundColor: "#222" }}
          />
        </ReactFlow>

        {selectedNode && (
          <PortalTooltip
            x={selectedNode.x}
            y={selectedNode.y}
            label={selectedNode.data.label}
            expectedStateLabel={
              selectedNode.data.expectedStateLabel ?? "Unknown"
            }
            expectedStateColor={
              NODE_COLORS[selectedNode.data.expectedStateRaw ?? "unknown"]
            }
            currentStateLabel={selectedNode.data.currentStateLabel ?? "Unknown"}
            currentStateColor={
              NODE_COLORS[selectedNode.data.currentStateRaw ?? "unknown"]
            }
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

export default SatelliteFlow;