import axios, { AxiosResponse } from "axios";

class SatelliteStatusService {
  private baseUrl: string = "http://localhost:8080/api/v1/satellite/temperature";
  private mockedData: number[] = [43, 21, 76, 98, 64, 32, 63, 28, 97, 85];
  constructor() {}

  public async getSatelliteStatus(): Promise<number[]> {
    try {
      /*const response: AxiosResponse<number[]> = await axios.get<number[]>(
        `${this.baseUrl}/satellite/status`
      );
      return response.data;
      */
      return this.mockedData;
    } catch (error) {
      console.error("Error fetching satellite status:", error);
      throw error;
    }
  }
}

export default SatelliteStatusService;
