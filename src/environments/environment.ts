// Configuración de conexión con el Ground Station Central Server (GSCS).
const env = import.meta.env;

const token: string = env.VITE_GSCS_TOKEN ?? "holis123";

export const environment = {
  REST_GSCS: (env.VITE_GSCS_URL ?? "http://localhost:8000/api").replace(/\/+$/, ""),
  BEARER_TOKEN: `Bearer ${token}`,
  POLLING_MS: Number(env.VITE_GSCS_POLLING_MS ?? 10000),
  // Identificador con el que Fomalhaut firma los mensajes que envía al GSCS.
  SOURCE_ID: "fomalhaut",
};

console.log("GSCS config:", environment); // TEMPORAL: borrar tras comprobar
