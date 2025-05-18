import { FC, useEffect, useState } from "react";
import "./Logs.css";
import LogsService from "./LogsService";
import { Log } from "./Log.model";
import { IoSync } from "react-icons/io5";

const Logs: FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const fetchLogs = () => {
    LogsService.getAllLogs()
      .then((response) => {
        setLogs(response.data);
        console.log("Lo que se recibe " + response)
      })
      .catch((err) => {
          console.log("Lo que se recibe en error " + err)
        setError("Error fetching logs. Please try again later. Explanation: " + err);
        setLogs([]);
      });
  };

  const filterLogs = () => {
    const params = new URLSearchParams();
    if (levelFilter) params.append("level", levelFilter);
    if (dateFilter) params.append("timestamp", dateFilter);

    LogsService.getLogsFilteredBy(params.toString())
      .then((response) => {
        setLogs(response.data);
      })
      .catch((err) => {
        setError("Error fetching filtered logs. Please try again later. Explanation: " + err);
        setLogs([]);
      });
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [levelFilter, dateFilter]);

  const getStatusClass = (level: string) => {
    switch (level) {
      case "DEBUG":
        return "status-debug";
      case "INFO":
        return "status-info";
      case "WARNING":
        return "status-warning";
      case "ERROR":
        return "status-error";
      case "CRITICAL":
        return "status-critical";
      default:
        return "";
    }
  };

  return (
    <div className="logs-container">
      <h1 className="logs-title">📄 System Logs</h1>
      <div className="logs-header">
        
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="logs-select"
          >
            <option value="">Todos los niveles</option>
            <option value="DEBUG">Debug</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="ERROR">Error</option>
            <option value="CRITICAL">Critical</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="logs-date"
          />

          <button className="logs-button" onClick={filterLogs}>
            <IoSync />
          </button>
       
        {error && <p className="logs-error">{error}</p>}
      </div>

      <div className="logs-scroll-area">
        
          {logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="logs-row" onClick={() => setSelectedLog(log)} style={{ cursor: "pointer" }}>
                <span className="logs-id">#{log.id}</span>
                <span className={`logs-level ${getStatusClass(log.level)}`}>
                  {log.level}
                </span>
                <span className="logs-message">{log.message}</span>
                <span className="logs-timestamp">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="logs-empty">No hay logs disponibles.</div>
          )}
        
      </div>

      {selectedLog && (
  <div className="log-modal-overlay" onClick={() => setSelectedLog(null)}>
    <div className="log-modal" onClick={(e) => e.stopPropagation()}>
      <button className="log-modal-close" onClick={() => setSelectedLog(null)}>
        &times;
      </button>
      <h2>Log #{selectedLog.id}</h2>
      <p><strong>Level:</strong> {selectedLog.level}</p>
      <p><strong>Message:</strong> {selectedLog.message}</p>
      <p><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
      <p><strong>Logger:</strong> {selectedLog.logger}</p>
      <p><strong>Module:</strong> {selectedLog.module}</p>
      <p><strong>Function:</strong> {selectedLog.function}</p>
      <p><strong>Client IP:</strong> {selectedLog.request_client_ip}</p>
      <p><strong>Status code:</strong> {selectedLog.request_status_code}</p>
      <p><strong>Request path:</strong> {selectedLog.request_path}</p>
      <p><strong>User:</strong> {selectedLog.request_user}</p>
      <p><strong>Exception:</strong> {selectedLog.exception_type}</p>
      <p><strong>Stack trace:</strong></p>
      <pre style={{ whiteSpace: "pre-wrap" }}>{selectedLog.exception_stack_trace}</pre>
      <p><strong>Extra:</strong></p>
      <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(selectedLog.extra_data, null, 2)}</pre>
    </div>
  </div>
)}

    </div>
  );
};

export default Logs;
