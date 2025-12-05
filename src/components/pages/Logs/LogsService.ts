import axios, { AxiosResponse, AxiosError } from "axios";
import { Log } from "./Log.model";
import { environment } from "../../../environments/environment.ts";

class LogsService {
  private readonly baseUrl: string = environment.REST_GSCS + "/telemetry";

  private readonly baseHeader: { headers: { Authorization: string } } = {
    headers: {
      Authorization: environment.BEARER_TOKEN,
    },
  };

  getAllLogs(): Promise<AxiosResponse<Log[]>> {
    const url = `${this.baseUrl}`;
    console.log("📡 Fetching logs from: " + url);
    return axios.get(url, this.baseHeader).catch((err: AxiosError) => {
      console.error("❌ Error fetching logs:", err);
      // Retornar lista vacía en caso de error para no romper la UI
      return { data: [] } as unknown as AxiosResponse<Log[]>;
    });
  }

  getLogsFilteredBy(query: string = ""): Promise<AxiosResponse<Log[]>> {
    if (query.length === 0) {
      return this.getAllLogs();
    }
    
    // Parsear el query para filtrar por tipo
    const params = new URLSearchParams(query);
    const type = params.get("level");
    
    if (type) {
      const url = `${this.baseUrl}/${type}`;
      console.log("📡 Fetching filtered logs from: " + url);
      return axios.get(url, this.baseHeader).catch((err: AxiosError) => {
        console.error("❌ Error fetching filtered logs:", err);
        return { data: [] } as unknown as AxiosResponse<Log[]>;
      });
    }
    
    return this.getAllLogs();
  }

  getLatestLogs(count: number = 50): Promise<AxiosResponse<Log[]>> {
    const url = `${this.baseUrl}/latest/${count}`;
    console.log("📡 Fetching latest logs from: " + url);
    return axios.get(url, this.baseHeader).catch((err: AxiosError) => {
      console.error("❌ Error fetching latest logs:", err);
      return { data: [] } as unknown as AxiosResponse<Log[]>;
    });
  }

  clearAllLogs(): Promise<AxiosResponse> {
    const url = `${this.baseUrl}/clear`;
    console.log("🗑️  Clearing logs from: " + url);
    return axios.delete(url, this.baseHeader);
  }
}

export default new LogsService();

