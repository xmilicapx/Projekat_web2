import type { QuizDto } from "../../models/quiz";

export interface IQuizApi {
  getAllQuizzes(token?: string): Promise<QuizDto[] | null>;
  addQuiz(newQuiz: QuizDto, token: string): Promise<boolean>;
  updateQuiz(updatedQuiz: QuizDto, token: string): Promise<boolean>;
  deleteQuiz(id: number, token: string): Promise<boolean>;
}
