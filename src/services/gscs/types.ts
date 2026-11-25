// Tipos que reflejan los schemas de la API del Ground Station Central Server.
// Fuente: ground-stations-central-server/apps/bridge/schemas.py,
//         apps/control/models.py y apps/audit/schemas.py

/* ---------- Enumerados (apps/control/models.py y apps/bridge/schemas.py) ---------- */

export const SUBSYSTEMS = [
  "EPS",
  "ADCS",
  "THERMAL",
  "COMMS",
  "PAYLOAD",
  "OBC",
  "GENERAL",
] as const;
export type Subsystem = (typeof SUBSYSTEMS)[number];

export const COMMAND_TYPES = [
  "CHANGE_MODE",
  "PAYLOAD_POWER",
  "ADCS_CONTROL",
  "TAKE_PICTURE",
  "THERMAL_CONTROL",
  "POWER_LINE",
  "DEPLOY_ANTENNA",
  "RECALIBRATE_SENSOR",
  "SOFTWARE_UPDATE",
] as const;
export type CommandType = (typeof COMMAND_TYPES)[number];

export const COMMAND_STATUSES = [
  "SENT",
  "RECEIVED",
  "ACCEPTED",
  "EXECUTED",
  "FAILED",
] as const;
export type CommandStatus = (typeof COMMAND_STATUSES)[number];

export const SYSTEM_MODES = [
  "TEST",
  "OFFLINE",
  "AWAIT_LAUNCH",
  "DEPLOYMENT",
  "INITIALIZATION",
  "CHECKING",
  "NOMINAL",
  "DETUMBLING",
  "SAFE",
  "EMERGENCY",
  "OPERATIONAL",
  "MAINTENANCE",
] as const;

export type EventSeverity = "INFO" | "WARNING" | "CRITICAL";
export type LogLevel = "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";

/** Destinos que acepta /bridge */
export type Destination =
  | "satellite"
  | "radio_station"
  | "optical_station"
  | "fomalhaut";

/* ---------- Mensajes ---------- */

interface BaseMessage {
  id?: number;
  message_type: string;
  source: string;
  destination: string;
  timestamp: string; // ISO 8601
}

export interface TelemetryMessage extends BaseMessage {
  subsystem: Subsystem | string;
  module: string;
  value: number | null;
  unit: string | null;
  valid: boolean;
}

export interface EventMessage extends BaseMessage {
  subsystem: Subsystem | string;
  severity: EventSeverity | string;
  code: string;
  description: string;
}

export interface StatusMessage extends BaseMessage {
  subsystem: Subsystem | string;
  state: Record<string, unknown>;
  mode: string;
}

export interface CommandMessage extends BaseMessage {
  subsystem: Subsystem | string;
  parameters: Record<string, unknown>;
  status: CommandStatus | string;
  execution_time: string | null;
  command_type: CommandType | string;
}

/** Cuerpo de POST  */
export interface CommandRequest {
  message_type?: "CM";
  source: string;
  destination: Destination;
  timestamp: string;
  subsystem: Subsystem;
  parameters: Record<string, unknown>;
  status: CommandStatus;
  execution_time?: string | null;
  command_type: CommandType;
}

export interface CommandSendResponse {
  status: "success";
  message: unknown;
  destination: string;
}

/* ---------- Filtros ---------- */

interface TimeRangeFilter {
  source?: string;
  destination?: string;
  timestamp_gte?: string;
  timestamp_lte?: string;
}

export interface TelemetryFilter extends TimeRangeFilter {
  subsystem?: string;
  module?: string;
  module_contains?: string;
  value_min?: number;
  value_max?: number;
  unit?: string;
  valid?: boolean;
}

export interface EventFilter extends TimeRangeFilter {
  subsystem?: string;
  severity?: string;
  severity_in?: string[];
  code?: string;
  code_contains?: string;
  description?: string;
}

export interface StatusFilter {
  source?: string;
  destination?: string;
  timestamp_gte?: string;
  subsystem?: string;
  mode?: string;
  mode_in?: string[];
}

export interface CommandFilter extends TimeRangeFilter {
  subsystem?: string;
  status?: string;
  status_in?: string[];
  command_type?: string;
  command_type_in?: string[];
}

/* ---------- Audit (logs) ---------- */

export interface LogFilter {
  timestamp_gte?: string;
  timestamp_lte?: string;
  level?: string;
  level_in?: string[];
  logger?: string;
  logger_contains?: string;
  module?: string;
  module_contains?: string;
  function?: string;
  message?: string;
  request_path_contains?: string;
  has_exception?: boolean;
  is_error?: boolean;
}

export interface LogStatistics {
  total_count: number;
  by_level: Record<string, number>;
  by_logger: Record<string, number>;
  by_module: Record<string, number>;
  error_rate: number;
  time_range: Record<string, string | null>;
}

/* ---------- General ---------- */

export interface HealthResponse {
  status: string;
  buffer_size: number;
}