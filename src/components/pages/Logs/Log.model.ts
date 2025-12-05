export interface Log {
  id?: number;
  timestamp?: string;
  type?: string;
  rawLine?: string;
  createdAt?: string;
  
  // System telemetry
  cpuUsage?: number;
  memoryFree?: number;
  uptime?: number;
  taskCount?: number;
  cpuTemp?: number;
  
  // Power telemetry
  voltage?: number;
  current?: number;
  solarVoltage?: number;
  solarCurrent?: number;
  batteryLevel?: number;
  batteryTemp?: number;
  
  // Temperature telemetry
  obcTemp?: number;
  commsTemp?: number;
  payloadTemp?: number;
  batteryTempFloat?: number;
  externalTemp?: number;
  
  // Comms telemetry
  rssi?: number;
  snr?: number;
  commsUptime?: number;
  successRate?: number;
}

