import axios from "axios";
import type { IResultApi } from "../interfaces/IResultApi";
import type { ResultDto } from "../../models/result";

const API_URL = import.meta.env.VITE_API_URL + "results/";

export class ResultApi implements IResultApi {
  async addResult(result: ResultDto, token: string): Promise<boolean> {
    try {
      const response = await axios.post(API_URL + "add", result, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getAllResults(token: string): Promise<ResultDto[] | null> {
    try {
      const response = await axios.get(API_URL + "all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as ResultDto[];
    } catch {
      return null;
    }
  }

  async getAllUserResultsByUsername(username: string, token: string): Promise<ResultDto[] | null> {
    try {
      const response = await axios.get(`${API_URL}user/${encodeURIComponent(username)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data as ResultDto[];
    } catch {
      return null;
    }
  }
}
