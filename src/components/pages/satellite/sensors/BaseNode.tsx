import React from "react";
import { NodeProps, Position, Handle } from "react-flow-renderer";

export interface BaseNodeData {
  label: string; // Texto que se muestra dentro del nodo.
  color: string; // Color de fondo del nodo, normalmente derivado del estado (working, off, etc.).
  info?: string; // Información adicional opcional sobre el componente (no se muestra aquí, pero puede usarse en tooltips u otros UIs).
}

// Nodo base utilizado por React Flow para representar un componente del satélite.
// Se trata de un nodo simple con dos handles (origen/destino) y un label, cuya
// apariencia (color/estilos) se controla desde CSS y desde la prop `color`.
const BaseNode: React.FC<NodeProps<BaseNodeData>> = ({
  data,
  sourcePosition,
  targetPosition,
}) => {
  return (
    <div
      className="custom-node"
      style={{ backgroundColor: data.color, cursor: "pointer" }}
    >
      {/* Handle de salida: desde aquí parten las conexiones hacia otros nodos. */}
      <Handle
        type="source"
        position={sourcePosition ?? Position.Right}
        className="custom-node__handle"
      />
      {/* Handle de entrada: aquí llegan las conexiones desde otros nodos. */}
      <Handle
        type="target"
        position={targetPosition ?? Position.Left}
        className="custom-node__handle"
      />
      {/* Etiqueta textual del nodo, normalmente el nombre del subsistema/componente. */}
      <span className="custom-node__label">{data.label}</span>
    </div>
  );
};

export default BaseNode;