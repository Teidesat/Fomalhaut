import axios, { AxiosResponse } from 'axios';
import { Log } from "./Log.model";


class LogsService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:8000/api/logvault/';
  }

  async getAllLogs(query: string = ''): Promise<Log[]> {
    const response: AxiosResponse<Log[]> = await axios.get(`${this.baseUrl}?${query}`, {
      headers: {
        Authorization: 'Bearer holis123', // ajusta si usas otro tipo de token
      },
    });
    return response.data;
  }
  
  /*
  async getLogById(id: number): Promise<Log> {
    const response: AxiosResponse<Log> = await axios.get(`${this.baseUrl}${id}/`, {
      headers: {
        Authorization: 'Bearer holis123',
      },
    });
    return response.data;
  }

  
  async createLog(log: Log): Promise<Log> {
    const response: AxiosResponse<Log> = await axios.post(this.baseUrl, log, {
      headers: {
        Authorization: 'Bearer holis123',
      },
    });
    return response.data;
  }

  async updateLog(id: number, log: Log): Promise<Log> {
    const response: AxiosResponse<Log> = await axios.put(`${this.baseUrl}${id}/`, log, {
      headers: {
        Authorization: 'Bearer holis123',
      },
    });
    return response.data;
  }

  async deleteLog(id: number): Promise<void> {
    await axios.delete(`${this.baseUrl}${id}/`, {
      headers: {
        Authorization: 'Bearer holis123',
      },
    });
  }

  async deleteAllLogsBeforeDate(): Promise<void> {
    await axios.delete(this.baseUrl, {
      headers: {
        Authorization: 'Bearer holis123',
      },
    });
  }

  */

}

export default new LogsService();
