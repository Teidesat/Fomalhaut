import React, { useEffect, useState } from "react";
import "./MessageHistoryTable.css";

interface LogEntry {
  id: number;
  timestamp: string;
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  message: string;
}

const MessageHistoryTable: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");

  const fetchLogs = () => {
    const params = new URLSearchParams();
    if (levelFilter) params.append("level", levelFilter);
    if (dateFilter) params.append("timestamp", dateFilter); // formato ISO: yyyy-mm-dd

    fetch(`http://localhost:8000/api/logvault/?${params.toString()}`, {
      headers: {
        Authorization: "Bearer holis123",
      },
    })
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error("Error fetching logs:", err));
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [levelFilter, dateFilter]);

  const generateSampleLogs = () => {
    fetch("http://localhost:8000/api/logvault/generate-sample/", {
      method: "POST",
      headers: {
        Authorization: "Bearer holis123",
      },
    })
      .then((res) => res.json())
      .then(() => fetchLogs())
      .catch((err) => console.error("Error generating sample logs:", err));
  };

  const clearLogs = () => {
    fetch("http://localhost:8000/api/logvault/clear/", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer holis123",
      },
    })
      .then((res) => res.json())
      .then(() => fetchLogs())
      .catch((err) => console.error("Error clearing logs:", err));
  };

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
    <div className="message-history-container">
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <button onClick={generateSampleLogs} className="generate-button">
          Generar Logs de Prueba
        </button>
        <button onClick={clearLogs} className="clear-button">
          Borrar Todos los Logs
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1rem",
          alignItems: "center",
        }}
      >
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="filter-select"
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
          className="filter-date"
        />
      </div>

      <table className="message-history-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Level</th>
            <th>Message</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.timestamp).toLocaleString()}</td>
              <td>{log.level}</td>
              <td>{log.message}</td>
              <td className={getStatusClass(log.level)}>{log.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MessageHistoryTable;
