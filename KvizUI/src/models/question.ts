export type QuestionType = "single" | "multiple" | "tf" | "text";

export type QuestionForm = {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[];
  correctIndexes: number[];
  tfAnswer?: boolean;
  textAnswer?: string;
};

export type QuestionJson = {
  id: number;
  type: QuestionType;
  prompt: string;
  options?: string[];
};

export type AnswerJson =
  | { id: number; correct: number }
  | { id: number; correct: number[] }
  | { id: number; correct: boolean }
  | { id: number; correct: string };

export type ParsedQuestionJson = QuestionJson & {
  correctIndexes?: number[];
  tfAnswer?: boolean;
  textAnswer?: string;
};

export type ParsedAnswerItem = {
  id: number;
  userAnswer?: number | number[] | boolean | string | null;
  correct?: number | number[] | boolean | string;
};
