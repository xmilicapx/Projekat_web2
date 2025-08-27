import { useEffect, useMemo, useState } from "react";
import type { QuizDto } from "../../models/quiz";
import type { IResultApi } from "../../api_services/interfaces/IResultApi";
import type { ResultDto } from "../../models/result";
import type { QuestionForm } from "../../models/question";
import { useAuth } from "../../auth/useAuth";
import {
  parseQuestionsFromJson,
  parseAnswersFromJson,
} from "../../utils/JsonParser";

type Props = {
  open: boolean;
  onClose: () => void;
  quiz: QuizDto | null;
  resultApi: IResultApi;
  token: string;
};

type UserAnswer =
  | { type: "single"; selected: number | null }
  | { type: "multiple"; selected: number[] }
  | { type: "tf"; answer: boolean | null }
  | { type: "text"; answer: string };

export default function PlayQuizModal({
  open,
  onClose,
  quiz,
  resultApi,
  token,
}: Props) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [, setCorrectAnswers] = useState<QuestionForm[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>(
    {}
  );
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [running, setRunning] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<{
    total: number;
    correct: number;
    percent: number;
  } | null>(null);
  const [, setDetailed] = useState<
    {
      qIndex: number;
      question: QuestionForm;
      correct: QuestionForm;
      userAnswer: UserAnswer | null;
      isCorrect: boolean;
    }[]
  >([]);

  useEffect(() => {
    if (!quiz) return;
    const qs = parseQuestionsFromJson(quiz.questions);
    const withAnswers = parseAnswersFromJson(quiz.answers, qs);
    setQuestions(withAnswers);
    setCorrectAnswers(withAnswers);
    setUserAnswers(() => {
      const init: Record<string, UserAnswer> = {};
      withAnswers.forEach((q) => {
        switch (q.type) {
          case "single":
            init[q.id] = { type: "single", selected: null };
            break;
          case "multiple":
            init[q.id] = { type: "multiple", selected: [] };
            break;
          case "tf":
            init[q.id] = { type: "tf", answer: null };
            break;
          default:
            init[q.id] = { type: "text", answer: "" };
        }
      });
      return init;
    });
    setTimeLeft(quiz.time && quiz.time > 0 ? quiz.time : 60);
    setSubmitted(false);
    setRunning(false);
    setScore(null);
    setDetailed([]);
  }, [quiz, open]);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  const start = () => {
    setRunning(true);
  };

  const handleChangeSingle = (qid: string, index: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qid]: { type: "single", selected: index },
    }));
  };

  const handleChangeMultiple = (
    qid: string,
    index: number,
    checked: boolean
  ) => {
    setUserAnswers((prev) => {
      const cur = prev[qid] as
        | { type: "multiple"; selected: number[] }
        | undefined;
      const arr = cur ? [...cur.selected] : [];
      if (checked) {
        if (!arr.includes(index)) arr.push(index);
      } else {
        const idx = arr.indexOf(index);
        if (idx >= 0) arr.splice(idx, 1);
      }
      return { ...prev, [qid]: { type: "multiple", selected: arr } };
    });
  };

  const handleChangeTF = (qid: string, val: boolean) => {
    setUserAnswers((prev) => ({ ...prev, [qid]: { type: "tf", answer: val } }));
  };

  const handleChangeText = (qid: string, text: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qid]: { type: "text", answer: text },
    }));
  };

  const calculateResult = () => {
    const total = questions.length;
    let correct = 0;
    const details: {
      qIndex: number;
      question: QuestionForm;
      correct: QuestionForm;
      userAnswer: UserAnswer | null;
      isCorrect: boolean;
    }[] = [];

    questions.forEach((q, idx) => {
      const ua = userAnswers[q.id] ?? null;
      let isCorrect = false;

      if (q.type === "single") {
        const correctIndex = q.correctIndexes[0] ?? -1;
        const sel = ua && ua.type === "single" ? ua.selected : null;
        isCorrect = sel !== null && sel === correctIndex;
      } else if (q.type === "multiple") {
        const correctSet = new Set<number>(q.correctIndexes.map(Number));
        const selArr = ua && ua.type === "multiple" ? ua.selected : [];
        const selSet = new Set<number>(selArr.map(Number));
        isCorrect =
          selSet.size === correctSet.size &&
          [...selSet].every((v) => correctSet.has(v));
      } else if (q.type === "tf") {
        const correctBool = Boolean(q.tfAnswer);
        const sel = ua && ua.type === "tf" ? ua.answer : null;
        isCorrect = sel !== null && sel === correctBool;
      } else {
        const expected = q.textAnswer?.trim() ?? "";
        const sel = ua && ua.type === "text" ? (ua.answer ?? "").trim() : "";
        isCorrect =
          expected.length > 0 &&
          sel.length > 0 &&
          expected.toLowerCase() === sel.toLowerCase();
      }

      if (isCorrect) correct += 1;
      details.push({
        qIndex: idx,
        question: q,
        correct: q,
        userAnswer: ua,
        isCorrect,
      });
    });

    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    setScore({ total, correct, percent });
    setDetailed(details);
  };

  const handleSubmit = async () => {
    if (!quiz || submitted) return;
    setSubmitted(true);
    setRunning(false);
    calculateResult();

    const resultPayload: ResultDto = {
      id: 0,
      quizName: quiz.name,
      username: user?.username ?? "unknown",
      questions: quiz.questions,
      answers: JSON.stringify(
        questions.map((q, idx) => {
          const ua = userAnswers[q.id];

          let userAnswer: number | number[] | boolean | string | null = null;

          if (!ua) {
            userAnswer = null;
          } else if (ua.type === "single" || ua.type === "multiple") {
            userAnswer = ua.selected;
          } else if (ua.type === "tf") {
            userAnswer = ua.answer;
          } else if (ua.type === "text") {
            userAnswer = ua.answer;
          }

          const base = {
            id: idx + 1,
            correct:
              q.type === "single"
                ? q.correctIndexes[0] ?? -1
                : q.type === "multiple"
                ? q.correctIndexes
                : q.type === "tf"
                ? q.tfAnswer
                : q.textAnswer ?? "",
          };

          return {
            ...base,
            userAnswer,
          };
        })
      ),

      quizDone: new Date().toISOString(),
    };

    try {
      await resultApi.addResult(resultPayload, token);
    } catch {
      // ignore
    }
  };

  const timeDisplay = useMemo(() => {
    const mins = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const secs = (timeLeft % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }, [timeLeft]);

  if (!open || !quiz) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => {
          if (!running) onClose();
        }}
      />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">{quiz.name}</h3>
            <div className="text-sm text-gray-600">
              {quiz.category} • {quiz.difficulty}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Time left</div>
            <div className="text-lg font-mono">{timeDisplay}</div>
          </div>
        </div>

        {!running && !submitted && (
          <div className="mb-4">
            <button
              onClick={start}
              className="px-4 py-1.5 bg-teal-600 text-white rounded-lg"
            >
              Start quiz
            </button>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ua = userAnswers[q.id] ?? null;
            return (
              <div key={q.id} className="border rounded-lg p-4">
                <div className="font-medium mb-2">
                  Q{idx + 1}. {q.prompt}
                </div>

                {(q.type === "single" || q.type === "multiple") && (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => {
                      const checked =
                        ua && ua.type === "single"
                          ? ua.selected === i
                          : ua && ua.type === "multiple"
                          ? ua.selected.includes(i)
                          : false;
                      return (
                        <label key={i} className="flex items-center gap-2">
                          <input
                            type={q.type === "single" ? "radio" : "checkbox"}
                            name={`q_${q.id}`}
                            checked={checked}
                            onChange={(e) => {
                              if (q.type === "single")
                                handleChangeSingle(q.id, i);
                              else
                                handleChangeMultiple(q.id, i, e.target.checked);
                            }}
                            disabled={!running || submitted}
                          />
                          <span>{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {q.type === "tf" && (
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={
                          ua && ua.type === "tf" ? ua.answer === true : false
                        }
                        onChange={() => handleChangeTF(q.id, true)}
                        disabled={!running || submitted}
                      />
                      True
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={
                          ua && ua.type === "tf" ? ua.answer === false : false
                        }
                        onChange={() => handleChangeTF(q.id, false)}
                        disabled={!running || submitted}
                      />
                      False
                    </label>
                  </div>
                )}

                {q.type === "text" && (
                  <div>
                    <input
                      value={ua && ua.type === "text" ? ua.answer : ""}
                      onChange={(e) => handleChangeText(q.id, e.target.value)}
                      className="w-full px-2 py-1 border rounded"
                      disabled={!running || submitted}
                    />
                  </div>
                )}

                {submitted && (
                  <div
                    className="mt-3 p-3 rounded border-l-4"
                    style={{
                      borderColor: q.correctIndexes.length
                        ? q.correctIndexes.includes(
                            ua && ua.type === "single"
                              ? ua.selected ?? -1
                              : -999
                          )
                          ? "green"
                          : "red"
                        : undefined,
                    }}
                  >
                    <div className="text-sm font-medium">Result</div>
                    <div className="text-sm">
                      Correct:{" "}
                      {q.type === "single" || q.type === "multiple"
                        ? q.options[q.correctIndexes[0] ?? 0] ?? "-"
                        : q.type === "tf"
                        ? String(q.tfAnswer)
                        : q.textAnswer}
                    </div>
                    <div className="text-sm">
                      Your answer:{" "}
                      {(() => {
                        const u = ua;
                        if (!u) return "No answer";
                        if (u.type === "single")
                          return typeof u.selected === "number"
                            ? q.options[u.selected] ?? `Option ${u.selected}`
                            : "No answer";
                        if (u.type === "multiple")
                          return (
                            u.selected
                              .map((i) => q.options[i] ?? `Option ${i}`)
                              .join(", ") || "No answer"
                          );
                        if (u.type === "tf") return String(u.answer);
                        return u.answer ?? "No answer";
                      })()}
                    </div>
                    {!(
                      (ua && ua.type === "text") ||
                      (ua && ua.type === "tf")
                    ) && (
                      <div className="text-xs text-gray-500 mt-1">
                        (Options shown – correct above)
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {!submitted && (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setRunning(false);
                  handleSubmit();
                }}
                className="px-4 py-1.5 bg-amber-600 text-white rounded-lg"
                disabled={!running}
              >
                Finish quiz
              </button>
            </div>
          )}

          {submitted && score && (
            <div className="text-right">
              <div className="text-sm">Total: {score.total}</div>
              <div className="text-sm">Correct: {score.correct}</div>
              <div className="text-sm font-semibold">
                Score: {score.percent}%
              </div>
            </div>
          )}

          <div>
            <button
              onClick={() => {
                if (!running) onClose();
              }}
              className="px-4 py-2 rounded-lg bg-gray-200"
            >
              Quit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
