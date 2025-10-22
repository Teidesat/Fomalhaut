import React from "react";
import { NodeProps, Position, Handle } from "react-flow-renderer";

export interface BaseNodeData {
  label: string;
  color: string;
  info?: string;
}

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
};

export default BaseNode;