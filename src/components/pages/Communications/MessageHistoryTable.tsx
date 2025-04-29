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
