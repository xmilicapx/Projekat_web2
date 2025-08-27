import axios from "axios";
import type { IQuizApi } from "../interfaces/IQuizApi";
import type { QuizDto } from "../../models/quiz";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5090/api/v1/";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export class QuizApi implements IQuizApi {
  async getAllQuizzes(token?: string): Promise<QuizDto[] | null> {
    try {
      const response = await axiosInstance.get<QuizDto[]>("quiz/all", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return response.data;
    } catch {
      return null;
    }
  }

  async addQuiz(newQuiz: QuizDto, token: string): Promise<boolean> {
    try {
      await axiosInstance.post("quiz/add", newQuiz, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch {
      return false;
    }
  }

  async updateQuiz(updatedQuiz: QuizDto, token: string): Promise<boolean> {
    try {
      await axiosInstance.put("quiz/update", updatedQuiz, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch {
      return false;
    }
  }

  async deleteQuiz(id: number, token: string): Promise<boolean> {
    try {
      await axiosInstance.delete(`quiz/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch {
      return false;
    }
  }
}
