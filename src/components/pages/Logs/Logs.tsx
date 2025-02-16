import { FC, useEffect, useState } from 'react';
import { format, formatDistance, subDays } from 'date-fns';

import './Logs.css';
import LogsService from './LogsService';
import { Log } from './Log.model';

interface LogsProps {}

const Logs: FC<LogsProps> = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const logsData = await LogsService.getAllLogs();
      console.log(logsData);
      setLogs(logsData);
    } catch (err) {
      setError('Error fetching logs. Please try again later.');
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="Logs">
      <h1>Logs</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="logs-container">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="log-card">
              <h3>{log.title}</h3>
              <p>{log.body}</p>
              <small>{format(new Date(log.dateTime), 'dd/MM/yyyy HH:mm:ss')} - {formatDistance(new Date(log.dateTime), new Date(), { addSuffix: true })}</small>
            </div>
          ))
        ) : (
          <p>No logs available.</p>
        )}
      </div>
    </div>
  );
};

export default Logs;
