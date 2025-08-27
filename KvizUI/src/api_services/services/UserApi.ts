import axios from "axios";
import type { LoginDto } from "../../models/login";
import type { UserDto } from "../../models/user";
import type { IUserApi } from "../interfaces/IUserApi";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5090/api/v1/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export class UserApi implements IUserApi {
  async authenticateUser(payload: LoginDto): Promise<string | null> {
    try {
      const response = await axiosInstance.post<string>("user/auth", payload);
      return response.data;
    } catch {
      return null;
    }
  }

  async registerUser(payload: UserDto): Promise<string | null> {
    try {
      const response = await axiosInstance.post<string>("user/register", payload);
      return response.data;
    } catch {
      return null;
    }
  }
}