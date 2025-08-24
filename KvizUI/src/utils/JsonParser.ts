import type { QuestionForm, QuestionJson, AnswerJson, ParsedQuestionJson, ParsedAnswerItem } from "../models/question";

export function emptyQuestion(id: string): QuestionForm {
  return {
    id,
    type: "single",
    prompt: "",
    options: ["", "", "", ""],
    correctIndexes: [],
    tfAnswer: true,
    textAnswer: ""
  };
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function parseQuestionsFromJson(qJson: string): QuestionForm[] {
  try {
    const parsed = JSON.parse(qJson) as QuestionJson[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p, idx) => ({
      id: `${uid()}_${p.id ?? idx + 1}`,
      type: p.type,
      prompt: String(p.prompt ?? ""),
      options: Array.isArray(p.options) ? p.options.map(String) : ["", "", "", ""],
      correctIndexes: [],
      tfAnswer: true,
      textAnswer: ""
    }));
  } catch {
    return [];
  }
}

export function parseAnswersFromJson(aJson: string, base: QuestionForm[]): QuestionForm[] {
  try {
    const parsed = JSON.parse(aJson) as AnswerJson[];
    if (!Array.isArray(parsed)) return base;
    return base.map((q, index) => {
      const ans = parsed.find((a) => a.id === index + 1);
      if (!ans) return q;
      if (q.type === "single") {
        const correctIndex = typeof (ans as { correct: number }).correct === "number"
          ? (ans as { correct: number }).correct
          : 0;
        return { ...q, correctIndexes: [Number(correctIndex)] };
      }
      if (q.type === "multiple") {
        const correctArr = Array.isArray((ans as { correct: number[] }).correct)
          ? (ans as { correct: number[] }).correct.map(Number)
          : [];
        return { ...q, correctIndexes: correctArr };
      }
      if (q.type === "tf") {
        const tf = typeof (ans as { correct: boolean }).correct === "boolean"
          ? (ans as { correct: boolean }).correct
          : Boolean((ans as { correct: number }).correct);
        return { ...q, tfAnswer: Boolean(tf) };
      }
      return { ...q, textAnswer: typeof (ans as { correct: string }).correct === "string" ? (ans as { correct: string }).correct : "" };
    });
  } catch {
    return base;
  }
}

export function buildJsonStrings(questions: QuestionForm[]): { questionsJson: string; answersJson: string } {
  const qs: QuestionJson[] = questions.map((q, idx) => {
    const base: QuestionJson = { id: idx + 1, type: q.type, prompt: q.prompt };
    if (q.type === "single" || q.type === "multiple") {
      base.options = q.options;
    }
    return base;
  });

  const answers: AnswerJson[] = questions.map((q, idx) => {
    if (q.type === "single") {
      return { id: idx + 1, correct: Number(q.correctIndexes[0] ?? 0) };
    }
    if (q.type === "multiple") {
      return { id: idx + 1, correct: q.correctIndexes.map(Number) };
    }
    if (q.type === "tf") {
      return { id: idx + 1, correct: Boolean(q.tfAnswer ?? true) };
    }
    return { id: idx + 1, correct: String(q.textAnswer ?? "") };
  });

  return { questionsJson: JSON.stringify(qs), answersJson: JSON.stringify(answers) };
}

export function parseQuestions(qJson: string): QuestionForm[] {
  try {
    const parsed = JSON.parse(qJson) as ParsedQuestionJson[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((p, idx) => ({
      id: `${idx + 1}`,
      type: p.type,
      prompt: p.prompt,
      options: p.options ?? ["", "", "", ""],
      correctIndexes: Array.isArray(p.correctIndexes) ? p.correctIndexes : [],
      tfAnswer: p.type === "tf" && typeof p.tfAnswer === "boolean" ? p.tfAnswer : undefined,
      textAnswer: p.type === "text" && typeof p.textAnswer === "string" ? p.textAnswer : undefined,
    }));
  } catch {
    return [];
  }
}

export function parseResultAnswers(answersJson: string): ParsedAnswerItem[] {
  try {
    const parsed = JSON.parse(answersJson);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => {
      if (item && typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        const idRaw = obj.id;
        const id = typeof idRaw === "number" ? idRaw : Number(idRaw ?? 0);
        const userAnswer = obj.userAnswer as
          | number
          | number[]
          | boolean
          | string
          | null
          | undefined;
        const correct = obj.correct as number | number[] | boolean | string | undefined;
        return { id, userAnswer, correct };
      }
      return { id: 0 };
    });
  } catch {
    return [];
  }
}