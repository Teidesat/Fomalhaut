import { FC } from "react";
import "./TemperatureMap.css";
import GrafanaDashboard from "./utils/GrafanaDashboard";

type TemperatureGraphsProps = object;

const TemperatureGraphs: FC<TemperatureGraphsProps> = () => {
  return (
    <div className="temperature-graphs">
      <div className="graphs-title">TEMPERATURE GRAPHS (Grafana)</div>
      <div className="grafana-panels">
        <GrafanaDashboard />
      </div>
    </div>
  );
};

export default TemperatureGraphs;
