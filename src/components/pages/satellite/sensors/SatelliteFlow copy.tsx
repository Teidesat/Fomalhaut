// SatelliteFlow.tsx
import React, { useMemo, useState, useEffect } from "react";
import ReactFlow, {
  Background,
  MarkerType,
  Position,
  Handle,
  Node,
  Edge,
  NodeProps,
} from "react-flow-renderer";

import satelliteData from "./sateliteStates.json";
import "./SatelliteFlow.css";
import telemetryData from "./telemetry.json";
import modeData from "./currentMode.json"; // Archivo JSON que contiene el modo actual

interface Telemetry {
  [key: string]: string;
}

interface ComponentType {
  id: string;
  label: string;
  type: string;
  position?: { x: number; y: number };
}

// Resuelve los auxiliares (_aux, _aux2...) copiando el valor del original
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

// Devuelve el color del nodo según la telemetría
const getNodeColor = (component: ComponentType, telemetry: Telemetry): string => {
  const state = telemetry[component.id] || "unknown";
  switch (state) {
    case "working":
      return "#4caf50"; // verde
    case "off":
      return "#f44336"; // rojo
    case "unknown":
    default:
      return "#9e9e9e"; // gris
  }
};

// Nodo personalizado
const BaseNode: React.FC<NodeProps> = ({ data, sourcePosition, targetPosition }) => (
  <div className="custom-node" style={{ backgroundColor: data.color }}>
    <Handle
      type="source"
      position={sourcePosition ?? Position.Right}
      className="custom-node__handle"
    />
    <Handle
      type="target"
      position={targetPosition ?? Position.Left}
      className="custom-node__handle"
    />
    <span className="custom-node__label">{data.label}</span>
  </div>
);

// Componente principal
const SatelliteFlow: React.FC = () => {
  const [telemetry, setTelemetry] = useState<Telemetry>({});
  const [mode, setMode] = useState("UNKNOWN");

  // Inicializar telemetría
  useEffect(() => {
    const resolvedTelemetry = resolveAuxTelemetry(telemetryData);
    setTelemetry(resolvedTelemetry);
  }, []);

  // Leer modo desde JSON
  useEffect(() => {
    if (modeData?.mode) {
      setMode(modeData.mode);
    }
  }, []);

  // Crear nodos
  const nodes: Node[] = useMemo(() => {
    return satelliteData.components.map((component, index) => {
      const nodeTypeMap: Record<string, { source: Position; target: Position }> = {
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

      const nodeConfig = nodeTypeMap[component.type] || nodeTypeMap.default;

      return {
        id: component.id,
        type: "base",
        data: {
          label: component.label,
          color: getNodeColor(component, telemetry),
        },
        position: component.position ?? { x: 150 * index, y: 50 },
        sourcePosition: nodeConfig.source,
        targetPosition: nodeConfig.target,
      };
    });
  }, [telemetry]);

  // Crear edges
  const edges: Edge[] = useMemo(() => {
    return satelliteData.connections.map((conn) => {
      const sourceNode = nodes.find((node) => node.id === conn.from);
      const sourceColor = sourceNode?.data?.color ?? "white";

      return {
        id: `${conn.from}-${conn.to}`,
        source: conn.from,
        target: conn.to,
        type: "step",
        markerEnd: { type: MarkerType.ArrowClosed, color: sourceColor },
        style: { strokeWidth: 2, stroke: sourceColor },
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      };
    });
  }, [nodes]);

  return (
    <>
      <div className="satellite-flow-container">
        <div className="satellite-flow-controls">
          <h2>Current Mode: {mode}</h2>
        </div>
      </div>
      <div className="satellite-flow">
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={{ base: BaseNode }} fitView>
          <Background
            color="#9e9e9e"
            gap={18}
            variant={"dots" as any}
            style={{ backgroundColor: "#222" }}
          />
        </ReactFlow>
      </div>
    </>
  );
};

export default SatelliteFlow;