import axios, { AxiosResponse } from 'axios';
import { Log } from "./Log.model";


class LogsService {

  private baseUrl: string = 'http://localhost:8000/api/logvault/';

  private baseHeader: any = {
      headers: {
        Authorization: 'Bearer holis123'
      }
    };

  constructor() {}

  getAllLogs(): Promise<AxiosResponse<Log[]>> {
    return axios.get(`${this.baseUrl}all`, this.baseHeader);
  }
  
  getLogsFilteredBy(query: string = ''): Promise<AxiosResponse<Log[]>> {
    console.log("Calling " + `${this.baseUrl}?${query}`);
    if (query.length === 0) {
      return this.getAllLogs();

    }
    return axios.get(`${this.baseUrl}filter?${query}`, this.baseHeader);
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
