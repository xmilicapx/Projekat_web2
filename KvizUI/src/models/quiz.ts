export interface QuizDto {
  id: number;
  name: string;
  description: string;
  category: string;
  time: number;
  difficulty: string;
  questions: string;
  answers: string;
}