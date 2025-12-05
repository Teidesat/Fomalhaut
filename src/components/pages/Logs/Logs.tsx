import { FC, useEffect, useState } from "react";
import "./Logs.css";
import LogsService from "./LogsService";
import { Log } from "./Log.model";
import { IoSync } from "react-icons/io5";

const Logs: FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchLogs = () => {
    if (typeFilter) {
      LogsService.getLogsFilteredBy(`level=${typeFilter}`)
        .then((response) => {
          setLogs(response.data || []);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching filtered logs:", err);
          setError(`Error fetching logs: ${err}`);
          setLogs([]);
        });
    } else {
      LogsService.getAllLogs()
        .then((response) => {
          setLogs(response.data || []);
          setError(null);
        })
        .catch((err) => {
          console.error("Error fetching logs:", err);
          setError(`Error fetching logs: ${err}`);
          setLogs([]);
        });
    }
  };

  useEffect(() => {
    fetchLogs();
    
    if (autoRefresh) {
      const interval = setInterval(fetchLogs, 2000); // Refresh cada 2 segundos
      return () => clearInterval(interval);
    }
  }, [typeFilter, autoRefresh]);

  const getTelemetryIcon = (type: string | undefined) => {
    switch (type) {
      case "system":
        return "💻";
      case "power":
        return "🔋";
      case "temperature":
        return "🌡️";
      case "comms":
        return "📡";
      default:
        return "📊";
    }
  };

  const formatTelemetryData = (log: Log): string => {
    const parts = [];
    
    if (log.type === "system") {
      if (log.cpuUsage != null) parts.push(`CPU: ${log.cpuUsage}%`);
      if (log.memoryFree != null) {
        const ramKb = Math.round(Number(log.memoryFree) / 1024);
        parts.push(`RAM: ${ramKb}KB`);
      }
      if (log.cpuTemp != null) parts.push(`Temp: ${log.cpuTemp.toFixed(1)}°C`);
    } else if (log.type === "power") {
      if (log.voltage != null) parts.push(`Bat: ${log.voltage.toFixed(2)}V`);
      if (log.current != null) parts.push(`${log.current.toFixed(2)}A`);
      if (log.batteryLevel != null) parts.push(`${log.batteryLevel}%`);
      if (log.solarVoltage != null) parts.push(`Solar: ${log.solarVoltage.toFixed(1)}V`);
    } else if (log.type === "temperature") {
      if (log.obcTemp != null) parts.push(`OBC: ${log.obcTemp.toFixed(1)}°C`);
      if (log.commsTemp != null) parts.push(`Comms: ${log.commsTemp.toFixed(1)}°C`);
      if (log.payloadTemp != null) parts.push(`Payload: ${log.payloadTemp.toFixed(1)}°C`);
      if (log.batteryTempFloat != null) parts.push(`Bat: ${log.batteryTempFloat.toFixed(1)}°C`);
    } else if (log.type === "comms") {
      if (log.rssi != null) parts.push(`RSSI: ${log.rssi}dBm`);
      if (log.snr != null) parts.push(`SNR: ${log.snr}dB`);
      if (log.successRate != null) parts.push(`${log.successRate}%`);
    }
    
    return parts.join(" | ") || log.rawLine || "No data";
  };

  const getTypeColor = (type: string | undefined) => {
    switch (type) {
      case "system":
        return "#3498db"; // Blue
      case "power":
        return "#f39c12"; // Orange
      case "temperature":
        return "#e74c3c"; // Red
      case "comms":
        return "#27ae60"; // Green
      default:
        return "#95a5a6"; // Gray
    }
  };

  return (
    <div className="logs-container">
      <h1 className="logs-title">📊 Telemetry Logs</h1>
      
      <div className="logs-header">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="logs-select"
        >
          <option value="">Todos los tipos</option>
          <option value="system">💻 Sistema</option>
          <option value="power">🔋 Potencia</option>
          <option value="temperature">🌡️ Temperatura</option>
          <option value="comms">📡 Comunicaciones</option>
        </select>

        <label className="logs-checkbox">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh
        </label>

        <button className="logs-button" onClick={fetchLogs} title="Refresh">
          <IoSync />
        </button>

        {error && <p className="logs-error">⚠️ {error}</p>}
      </div>

      <div className="logs-scroll-area">
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div
              key={index}
              className="logs-row"
              onClick={() => setSelectedLog(log)}
              style={{
                cursor: "pointer",
                borderLeftColor: getTypeColor(log.type),
                borderLeftWidth: "4px",
                paddingLeft: "12px",
              }}
            >
              <span className="logs-icon">
                {getTelemetryIcon(log.type)}
              </span>
              <span className="logs-type">{log.type || "general"}</span>
              <span className="logs-message">{formatTelemetryData(log)}</span>
              <span className="logs-timestamp">
                {log.timestamp
                  ? new Date(log.timestamp).toLocaleTimeString()
                  : "N/A"}
              </span>
            </div>
          ))
        ) : (
          <div className="logs-empty">
            {error ? "Error loading logs" : "No logs available"}
          </div>
        )}
      </div>

      {selectedLog && (
        <div className="log-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="log-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="log-modal-close"
              onClick={() => setSelectedLog(null)}
            >
              &times;
            </button>
            <h2>
              {getTelemetryIcon(selectedLog.type)} {selectedLog.type || "Log"}
            </h2>
            <p>
              <strong>Timestamp:</strong>{" "}
              {selectedLog.timestamp
                ? new Date(selectedLog.timestamp).toLocaleString()
                : "N/A"}
            </p>
            <p>
              <strong>Type:</strong> {selectedLog.type || "general"}
            </p>
            <p>
              <strong>Raw Line:</strong> {selectedLog.rawLine}
            </p>

            {selectedLog.type === "system" && (
              <>
                {selectedLog.cpuUsage !== undefined && (
                  <p>
                    <strong>CPU Usage:</strong> {selectedLog.cpuUsage}%
                  </p>
                )}
                {selectedLog.memoryFree !== undefined && (
                  <p>
                    <strong>Memory Free:</strong> {Math.round(selectedLog.memoryFree / 1024)}KB
                  </p>
                )}
                {selectedLog.cpuTemp !== undefined && (
                  <p>
                    <strong>CPU Temp:</strong> {selectedLog.cpuTemp.toFixed(1)}°C
                  </p>
                )}
              </>
            )}

            {selectedLog.type === "power" && (
              <>
                {selectedLog.voltage !== undefined && (
                  <p>
                    <strong>Battery Voltage:</strong> {selectedLog.voltage.toFixed(2)}V
                  </p>
                )}
                {selectedLog.current !== undefined && (
                  <p>
                    <strong>Current:</strong> {selectedLog.current.toFixed(3)}A
                  </p>
                )}
                {selectedLog.batteryLevel !== undefined && (
                  <p>
                    <strong>Battery Level:</strong> {selectedLog.batteryLevel}%
                  </p>
                )}
                {selectedLog.solarVoltage !== undefined && (
                  <p>
                    <strong>Solar Voltage:</strong> {selectedLog.solarVoltage.toFixed(2)}V
                  </p>
                )}
              </>
            )}

            {selectedLog.type === "temperature" && (
              <>
                {selectedLog.obcTemp !== undefined && (
                  <p>
                    <strong>OBC Temp:</strong> {selectedLog.obcTemp.toFixed(1)}°C
                  </p>
                )}
                {selectedLog.commsTemp !== undefined && (
                  <p>
                    <strong>Comms Temp:</strong> {selectedLog.commsTemp.toFixed(1)}°C
                  </p>
                )}
                {selectedLog.payloadTemp !== undefined && (
                  <p>
                    <strong>Payload Temp:</strong> {selectedLog.payloadTemp.toFixed(1)}°C
                  </p>
                )}
                {selectedLog.batteryTempFloat !== undefined && (
                  <p>
                    <strong>Battery Temp:</strong> {selectedLog.batteryTempFloat.toFixed(1)}°C
                  </p>
                )}
              </>
            )}

            {selectedLog.type === "comms" && (
              <>
                {selectedLog.rssi !== undefined && (
                  <p>
                    <strong>RSSI:</strong> {selectedLog.rssi}dBm
                  </p>
                )}
                {selectedLog.snr !== undefined && (
                  <p>
                    <strong>SNR:</strong> {selectedLog.snr}dB
                  </p>
                )}
                {selectedLog.successRate !== undefined && (
                  <p>
                    <strong>Success Rate:</strong> {selectedLog.successRate}%
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Logs;

