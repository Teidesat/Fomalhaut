import { FC, useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


interface TemperatureGraphsProps {
temperatureData: { name: string; temperature: number }[];
}


const predefinedColors: Record<string, string> = {
    "Eps Storage": "#FF0000", // Red
    "Obc + Transceptor": "#00FF00", // Green
    "Lomoboard": "#ADD8E6", // Light Blue
    "Pyl Controller": "#FFFF00", // Yellow
};

const getColorForPart = (partName: string) => {
    return predefinedColors[partName] || `hsl(${Math.random() * 360}, 100%, 50%)`;
};

const TemperatureGraphs: FC<TemperatureGraphsProps> = ({ temperatureData }) => {
const [history, setHistory] = useState<{ time: number; [key: string]: number }[]>([]);

useEffect(() => {
    if (temperatureData.length === 0) return;

    const newEntry: { time: number; [key: string]: number } = { time: Date.now() };
    temperatureData.forEach((part) => {
    newEntry[part.name] = part.temperature;
    });

    setHistory((prevHistory) => [...prevHistory.slice(-15), newEntry]);
}, [temperatureData]);

const calculateStats = (partName: string) => {
    const values = history.map((entry) => entry[partName]).filter((value) => value !== undefined);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length;
    return { min, max, avg };
};

return (
    <div className="temperature-graphs">
    <div className="graphs-title">TEMPERATURE GRAPHS</div>
    <ResponsiveContainer className="chart-container">
        <LineChart data={history}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
        dataKey="time"
        tickFormatter={(time) => new Date(time).toLocaleTimeString()}
        />
        <YAxis />
        <Tooltip
        labelFormatter={(label) => new Date(label).toLocaleTimeString()}
        />
        <Legend />
        {temperatureData.map((part) => (
        <Line
        key={part.name}
        type="monotone"
        dataKey={part.name}
        stroke={getColorForPart(part.name)}
        strokeWidth={2}
        dot={false}
        />
        ))}
        </LineChart>
    </ResponsiveContainer>
    <div className="temperature-stats">
    <div className="stats-title">TEMPERATURE STATS</div>
    <table className="stats-content">
        <thead>
        <tr>
        <th>Part Name</th>
        <th>Min Temperature</th>
        <th>Max Temperature</th>
        <th>Avg Temperature</th>
        </tr>
        </thead>
        <tbody>
        {temperatureData.map((part) => {
        const stats = calculateStats(part.name);
        return (
        <tr key={part.name} className="stat-item">
            <td className="stat-label">{part.name}</td>
            <td className="stat-value">{stats.min.toFixed(1)}°C</td>
            <td className="stat-value">{stats.max.toFixed(1)}°C</td>
            <td className="stat-value">{stats.avg.toFixed(1)}°C</td>
        </tr>
        );
        })}
        </tbody>
    </table>
    </div>
    </div>
);
};

export default TemperatureGraphs;