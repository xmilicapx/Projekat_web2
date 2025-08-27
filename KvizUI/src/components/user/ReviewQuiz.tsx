import { useMemo } from "react";
import type { ResultDto } from "../../models/result";
import { parseQuestions, parseResultAnswers } from "../../utils/JsonParser";
import type { ParsedAnswerItem } from "../../models/question";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type Props = {
  open: boolean;
  onClose: () => void;
  result: ResultDto | null;
  allResults: ResultDto[];
};

export default function ReviewResultModal({
  open,
  onClose,
  result,
  allResults,
}: Props) {
  const questions = useMemo(
    () => (result ? parseQuestions(result.questions) : []),
    [result]
  );
  const parsedAnswers = useMemo(
    () => (result ? parseResultAnswers(result.answers) : []),
    [result]
  );

  const answersMap = useMemo(() => {
    const m = new Map<
      number,
      {
        userAnswer?: ParsedAnswerItem["userAnswer"];
        correct?: ParsedAnswerItem["correct"];
      }
    >();
    parsedAnswers.forEach((a) => {
      if (a.id) m.set(a.id, { userAnswer: a.userAnswer, correct: a.correct });
    });
    return m;
  }, [parsedAnswers]);

  function calculateScore(result: ResultDto): number {
    try {
      const parsed = JSON.parse(result.answers);
      if (!Array.isArray(parsed)) return 0;

      let correctCount = 0;

      parsed.forEach((a: { correct?: unknown; userAnswer?: unknown }) => {
        const { correct, userAnswer } = a;

        if (Array.isArray(correct) && Array.isArray(userAnswer)) {
          const a1 = correct.map(String).sort();
          const a2 = userAnswer.map(String).sort();
          if (a1.length === a2.length && a1.every((v, i) => v === a2[i]))
            correctCount++;
        } else if (String(correct) === String(userAnswer)) {
          correctCount++;
        }
      });

      return Math.round((correctCount / parsed.length) * 100);
    } catch {
      return 0;
    }
  }

  const attempts = useMemo(() => {
    if (!result || !allResults.length) return [];

    return allResults
      .filter(
        (r) => r.quizName === result.quizName && r.username === result.username
      )
      .sort(
        (a, b) =>
          new Date(a.quizDone).getTime() - new Date(b.quizDone).getTime()
      )
      .map((r) => ({
        date: new Date(r.quizDone).toLocaleDateString(),
        score: calculateScore(r),
      }));
  }, [result, allResults]);

  if (!open || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl p-6 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">{result.quizName}</h3>
            <div className="text-sm text-gray-600">
              {new Date(result.quizDone).toLocaleString()}
            </div>
          </div>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200">
            Close
          </button>
        </div>

        {attempts.length > 1 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-2">Grafikon napretka</h4>
            <div className="h-64 bg-white border rounded-lg p-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attempts}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#8884d8"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const id = idx + 1;
            const entry = answersMap.get(id);
            const userAnswer = entry?.userAnswer;
            const correct = entry?.correct;

            const renderUser = (): string => {
              if (userAnswer === undefined || userAnswer === null)
                return "No answer";
              if (q.type === "single" && typeof userAnswer === "number") {
                return q.options[userAnswer] ?? `Option ${userAnswer}`;
              }
              if (q.type === "multiple" && Array.isArray(userAnswer)) {
                return userAnswer
                  .map((i) =>
                    typeof i === "number"
                      ? q.options[i] ?? `Option ${i}`
                      : String(i)
                  )
                  .join(", ");
              }
              if (q.type === "tf" && typeof userAnswer === "boolean") {
                return userAnswer ? "True" : "False";
              }
              if (q.type === "text" && typeof userAnswer === "string") {
                return userAnswer || "No answer";
              }
              return String(userAnswer);
            };

            const renderCorrect = (): string | null => {
              if (correct === undefined) return null;
              if (q.type === "single" && typeof correct === "number") {
                return q.options[correct] ?? `Option ${correct}`;
              }
              if (q.type === "multiple" && Array.isArray(correct)) {
                return correct
                  .map((i) =>
                    typeof i === "number"
                      ? q.options[i] ?? `Option ${i}`
                      : String(i)
                  )
                  .join(", ");
              }
              if (q.type === "tf" && typeof correct === "boolean") {
                return correct ? "True" : "False";
              }
              if (q.type === "text" && typeof correct === "string") {
                return correct || "No answer";
              }
              return String(correct);
            };

            const isCorrect = (() => {
              if (correct === undefined) return undefined;
              if (
                q.type === "multiple" &&
                Array.isArray(correct) &&
                Array.isArray(userAnswer)
              ) {
                const a = correct.map(String).sort();
                const b = userAnswer.map(String).sort();
                return a.length === b.length && a.every((v, i) => v === b[i]);
              }
              return String(correct) === String(userAnswer);
            })();

            return (
              <div key={q.id} className="border rounded-lg p-4">
                <div className="font-medium mb-2">
                  Q{idx + 1}. {q.prompt}
                </div>

                {(q.type === "single" || q.type === "multiple") && (
                  <div className="mb-2 space-y-1">
                    {q.options.map((opt, i) => {
                      const isCorrectOption =
                        (Array.isArray(correct) && correct.includes(i)) ||
                        correct === i;

                      const isUserSelected =
                        (Array.isArray(userAnswer) && userAnswer.includes(i)) ||
                        userAnswer === i;

                      return (
                        <div
                          key={i}
                          className={`flex items-center gap-2 ${
                            isCorrectOption
                              ? "bg-green-100"
                              : isUserSelected
                              ? "bg-red-100"
                              : ""
                          } rounded px-2`}
                        >
                          <div className="w-4">{i + 1}.</div>
                          <div>
                            {opt}
                            {isCorrectOption && " (Correct)"}
                            {isUserSelected &&
                              !isCorrectOption &&
                              " (Answered)"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  className={`p-3 rounded ${
                    isCorrect === true
                      ? "bg-green-50"
                      : isCorrect === false
                      ? "bg-red-50"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="text-sm">
                    Your answer:{" "}
                    <span className="font-medium">{renderUser()}</span>
                  </div>
                  {correct !== undefined && (
                    <div className="text-sm">
                      Correct answer:{" "}
                      <span className="font-medium">{renderCorrect()}</span>
                    </div>
                  )}
                  {isCorrect === false && (
                    <div className="text-sm text-red-600 mt-1">Incorrect</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
