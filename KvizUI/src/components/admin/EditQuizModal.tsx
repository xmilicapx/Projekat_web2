import { useEffect, useState } from "react";
import type { QuizDto } from "../../models/quiz";
import type { IQuizApi } from "../../api_services/interfaces/IQuizApi";
import type { QuestionForm, QuestionType } from "../../models/question";
import {
  parseQuestionsFromJson,
  emptyQuestion,
  parseAnswersFromJson,
  buildJsonStrings,
} from "../../utils/JsonParser";

type Props = {
  open: boolean;
  onClose: () => void;
  quiz: QuizDto | null;
  quizApi: IQuizApi;
  token: string;
  onSaved?: () => void;
};

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

export default function EditQuizModal({
  open,
  onClose,
  quiz,
  quizApi,
  token,
  onSaved,
}: Props) {
  const [local, setLocal] = useState<QuizDto | null>(null);
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!quiz) {
      setLocal(null);
      setQuestions([]);
      setError(null);
      return;
    }
    setLocal({ ...quiz });
    const parsedQs = parseQuestionsFromJson(quiz.questions ?? "");
    const baseQs = parsedQs.length > 0 ? parsedQs : [emptyQuestion(uid())];
    const withAnswers = parseAnswersFromJson(quiz.answers ?? "[]", baseQs);
    setQuestions(withAnswers.length > 0 ? withAnswers : baseQs);
    setError(null);
  }, [quiz, open]);

  if (!open) return null;

  function changeLocal(patch: Partial<QuizDto>) {
    setLocal((l) => (l ? { ...l, ...patch } : l));
  }

  function addQuestion() {
    setQuestions((q) => [...q, emptyQuestion(uid())]);
  }

  function removeQuestion(id: string) {
    setQuestions((q) => q.filter((x) => x.id !== id));
  }

  function updateQuestion(id: string, patch: Partial<QuestionForm>) {
    setQuestions((q) => q.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  }

  function validate(): string | null {
    if (!local) return "Invalid quiz";
    if (!local.name.trim()) return "Name required";
    if (questions.length === 0) return "Add at least one question";
    for (const q of questions) {
      if (!q.prompt.trim()) return "Each question needs a prompt";
      if (q.type === "single" || q.type === "multiple") {
        if (q.options.some((o) => !o.trim()))
          return "All options must be filled";
        if (q.type === "single" && q.correctIndexes.length !== 1)
          return "Single-choice must have exactly one correct option";
        if (q.type === "multiple" && q.correctIndexes.length === 0)
          return "Multiple-choice must have at least one correct option";
      }
      if (q.type === "text" && !q.textAnswer?.trim())
        return "Text question must have expected answer";
      if (q.type === "tf" && typeof q.tfAnswer !== "boolean")
        return "True/False question must have an answer";
    }
    return null;
  }

  async function onSave() {
    setError(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    if (!local) return;
    setLoading(true);
    const { questionsJson, answersJson } = buildJsonStrings(questions);
    const dto: QuizDto = {
      ...local,
      questions: questionsJson,
      answers: answersJson,
    };
    try {
      const ok = await quizApi.updateQuiz(dto, token);
      if (ok) {
        onSaved?.();
        onClose();
      } else {
        setError("Failed to update quiz");
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-6 z-10 no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Edit Quiz</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-100">
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            className="col-span-2 px-3 py-2 border rounded"
            placeholder="Name"
            value={local?.name ?? ""}
            onChange={(e) => changeLocal({ name: e.target.value })}
          />
          <select
            className="px-3 py-2 border rounded"
            value={local?.difficulty ?? "Easy"}
            onChange={(e) => changeLocal({ difficulty: e.target.value })}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <div className="mb-3">
          <textarea
            placeholder="Description"
            className="w-full px-3 py-2 border rounded h-20"
            value={local?.description ?? ""}
            onChange={(e) => changeLocal({ description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input
            placeholder="Category"
            className="px-3 py-2 border rounded"
            value={local?.category ?? ""}
            onChange={(e) => changeLocal({ category: e.target.value })}
          />
          <input
            type="number"
            min={5}
            placeholder="Time (seconds)"
            className="px-3 py-2 border rounded"
            value={local?.time ?? 0}
            onChange={(e) => changeLocal({ time: Number(e.target.value) })}
          />
          <div />
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => (
            <div key={q.id} className="border rounded-lg p-4 bg-slate-50">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">Question #{idx + 1}</div>
                <div className="flex gap-2">
                  <select
                    value={q.type}
                    onChange={(e) =>
                      updateQuestion(q.id, {
                        type: e.target.value as QuestionType,
                        options:
                          e.target.value === "single"
                            ? ["", "", "", ""]
                            : q.options,
                      })
                    }
                    className="px-2 py-1 border rounded"
                  >
                    <option value="single">Single choice</option>
                    <option value="multiple">Multiple choice</option>
                    <option value="tf">True / False</option>
                    <option value="text">Text answer</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeQuestion(q.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <input
                placeholder="Prompt"
                value={q.prompt}
                onChange={(e) =>
                  updateQuestion(q.id, { prompt: e.target.value })
                }
                className="w-full px-3 py-2 border rounded mb-2"
              />

              {(q.type === "single" || q.type === "multiple") && (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {q.type === "single" ? (
                          <input
                            type="radio"
                            checked={q.correctIndexes.includes(i)}
                            onChange={() =>
                              updateQuestion(q.id, { correctIndexes: [i] })
                            }
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={q.correctIndexes.includes(i)}
                            onChange={(e) => {
                              const arr = new Set(q.correctIndexes);
                              if (e.target.checked) arr.add(i);
                              else arr.delete(i);
                              updateQuestion(q.id, {
                                correctIndexes: Array.from(arr),
                              });
                            }}
                          />
                        )}
                        <input
                          value={opt}
                          onChange={(e) => {
                            const copy = [...q.options];
                            copy[i] = e.target.value;
                            updateQuestion(q.id, { options: copy });
                          }}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 px-2 py-1 border rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {q.type === "tf" && (
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={q.tfAnswer === true}
                      onChange={() => updateQuestion(q.id, { tfAnswer: true })}
                    />
                    True
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={q.tfAnswer === false}
                      onChange={() => updateQuestion(q.id, { tfAnswer: false })}
                    />
                    False
                  </label>
                </div>
              )}

              {q.type === "text" && (
                <div>
                  <input
                    placeholder="Expected text answer"
                    value={q.textAnswer}
                    onChange={(e) =>
                      updateQuestion(q.id, { textAnswer: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              )}
            </div>
          ))}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Add question
            </button>
          </div>
        </div>

        {error && <div className="text-red-600 mt-3">{error}</div>}

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-4 py-2 rounded bg-teal-600 text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
