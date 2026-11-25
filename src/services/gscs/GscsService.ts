// Cliente de la API del Ground Station Central Server (GSCS).
// Todas las llamadas de Fomalhaut al servidor central pasan por aquí, de forma
// que un cambio de contrato en la API solo obliga a tocar este fichero y types.ts.

import axios, { AxiosError } from "axios";
import { environment } from "../../environments/environment.ts";
import { Log } from "../../components/pages/Logs/Log.model";
import {
  CommandFilter,
  CommandMessage,
  CommandRequest,
  CommandSendResponse,
  Destination,
  EventFilter,
  EventMessage,
  HealthResponse,
  LogFilter,
  LogStatistics,
  StatusFilter,
  StatusMessage,
  TelemetryFilter,
  TelemetryMessage,
} from "./types";

const http = axios.create({
  baseURL: environment.REST_GSCS,
  timeout: 15000,
  headers: { Authorization: environment.BEARER_TOKEN },
  // Django Ninja espera listas como claves repetidas: level_in=A&level_in=B
  paramsSerializer: { indexes: null },
});

/** Elimina parámetros vacíos para no enviar filtros "undefined" o "" al servidor. */
const clean = (params: object = {}): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, v]) =>
        v !== undefined &&
        v !== null &&
        v !== "" &&
        !(Array.isArray(v) && v.length === 0),
    ),
  );

const get = async <T>(url: string, params?: object): Promise<T> =>
  (await http.get<T>(url, { params: clean(params) })).data;

/** Ordena de más reciente a más antiguo (el servidor no garantiza orden). */
export const sortByTimestampDesc = <T extends { timestamp: string }>(
  items: T[],
): T[] =>
  [...items].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );

/** ISO 8601 de "ahora menos N minutos", útil para acotar las consultas históricas. */
export const minutesAgoISO = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString();

/** Extrae un mensaje legible de un error del GSCS ({error, detail} o {detail}). */
export const describeError = (err: unknown): string => {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<Record<string, unknown>>;
    if (!e.response) {
      return `No se pudo conectar con el servidor central (${environment.REST_GSCS}).`;
    }
    const body = e.response.data ?? {};
    const parts = [body.error, body.detail]
      .filter(Boolean)
      .map((p) => (typeof p === "string" ? p : JSON.stringify(p)));
    if (e.response.status === 401) parts.unshift("Token no válido (401).");
    return parts.length > 0
      ? parts.join(" — ")
      : `HTTP ${e.response.status} ${e.response.statusText}`;
  }
  return err instanceof Error ? err.message : String(err);
};

const GscsService = {
  /* ---------- General ---------- */
  getHealth: () => get<HealthResponse>("/health"),

  /* ---------- Bridge: histórico ---------- */
  getTelemetry: (filter?: TelemetryFilter) =>
    get<TelemetryMessage[]>("/bridge/historical/telemetry", filter),
  getEvents: (filter?: EventFilter) =>
    get<EventMessage[]>("/bridge/historical/events", filter),
  getStatus: (filter?: StatusFilter) =>
    get<StatusMessage[]>("/bridge/historical/status", filter),
  getCommands: (filter?: CommandFilter) =>
    get<CommandMessage[]>("/bridge/historical/commands", filter),
  getDestinations: () => get<Destination[]>("/bridge/destinations"),

  /* ---------- Bridge: tiempo real ---------- */
  sendCommand: async (command: CommandRequest): Promise<CommandSendResponse> =>
    (
      await http.post<CommandSendResponse>("/bridge/stream/commands", {
        message_type: "CM",
        ...command,
      })
    ).data,

  /* ---------- Audit (logs) ---------- */
  getLogs: (filter?: LogFilter) => get<Log[]>("/audit/", filter),
  getLogErrors: (limit = 100) => get<Log[]>("/audit/errors", { limit }),
  getLogStatistics: (hours = 24) =>
    get<LogStatistics>("/audit/statistics", { hours }),
  getLogById: (id: number) => get<Log>(`/audit/${id}`),
};

export default GscsService;