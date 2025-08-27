import React, { useState } from "react";
import type { IQuizApi } from "../../api_services/interfaces/IQuizApi";
import type { QuizDto } from "../../models/quiz";

type QuestionType = "single" | "multiple" | "tf" | "text";

type QuestionForm = {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string[]; // for single/multiple (4 options for single)
  correctIndexes: number[]; // for single/multiple store indexes
  tfAnswer?: boolean; // for tf
  textAnswer?: string; // for text
};

type Props = {
  quizApi: IQuizApi;
  onSaved?: () => void;
};

const emptyQuestion = (id: string): QuestionForm => ({
  id,
  type: "single",
  prompt: "",
  options: ["", "", "", ""],
  correctIndexes: [],
  tfAnswer: true,
  textAnswer: ""
});

const AddQuizForm: React.FC<Props> = ({ quizApi, onSaved }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [time, setTime] = useState<number>(60);
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard" | string>(
    "Easy"
  );
  const [questions, setQuestions] = useState<QuestionForm[]>([
    emptyQuestion(cryptoRandomId())
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function cryptoRandomId() {
    return Math.random().toString(36).slice(2, 9);
  }

  const addQuestion = () =>
    setQuestions((q) => [...q, emptyQuestion(cryptoRandomId())]);

  const removeQuestion = (id: string) =>
    setQuestions((q) => q.filter((x) => x.id !== id));

  const updateQuestion = (id: string, patch: Partial<QuestionForm>) =>
    setQuestions((q) => q.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const validate = (): string | null => {
    if (!name.trim()) return "Name is required";
    if (questions.length === 0) return "Add at least one question";
    for (const q of questions) {
      if (!q.prompt.trim()) return "Every question needs a prompt";
      if ((q.type === "single" || q.type === "multiple")) {
        if (q.options.some((o) => !o.trim())) return "All options must be filled";
        if (q.type === "single" && q.correctIndexes.length !== 1)
          return "Single-choice questions must have exactly one correct option";
        if (q.type === "multiple" && q.correctIndexes.length === 0)
          return "Multiple-choice must have at least one correct option";
      }
      if (q.type === "tf" && typeof q.tfAnswer !== "boolean") return "TF need answer";
      if (q.type === "text" && !q.textAnswer?.trim()) return "Text answer required";
    }
    return null;
  };

  const buildPayload = (): { questionsJson: string; answersJson: string } => {
    const qs = questions.map((q, idx) => {
      const base: Record<string, unknown> = {
        id: idx + 1,
        type: q.type,
        prompt: q.prompt,
      };
      if (q.type === "single" || q.type === "multiple") {
        base.options = q.options;
      }
      return base;
    });

    const answers = questions.map((q, idx) => {
      if (q.type === "single") return { id: idx + 1, correct: q.correctIndexes[0] };
      if (q.type === "multiple") return { id: idx + 1, correct: q.correctIndexes };
      if (q.type === "tf") return { id: idx + 1, correct: q.tfAnswer ? true : false };
      return { id: idx + 1, correct: q.textAnswer ?? "" };
    });

    return { questionsJson: JSON.stringify(qs), answersJson: JSON.stringify(answers) };
  };

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setSuccess(null);
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    const { questionsJson, answersJson } = buildPayload();
    const token = localStorage.getItem("token") ?? "";
    const dto: QuizDto = {
      id: 0,
      name,
      description,
      category,
      time,
      difficulty,
      questions: questionsJson,
      answers: answersJson
    };
    try {
      const ok = await quizApi.addQuiz(dto, token);
      if (ok) {
        setSuccess("Quiz added");
        setName("");
        setDescription("");
        setCategory("");
        setTime(60);
        setDifficulty("Easy");
        setQuestions([emptyQuestion(cryptoRandomId())]);
        onSaved?.();
      } else {
        setError("Failed to save");
      }
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          placeholder="Quiz name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-2 px-3 py-2 border rounded-lg"
        />
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as string)}
          className="px-3 py-2 border rounded-lg"
        >
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
      </div>

      <div>
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        />
        <input
          type="number"
          min={10}
          value={time}
          onChange={(e) => setTime(Number(e.target.value))}
          className="px-3 py-2 border rounded-lg"
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
                      options: e.target.value === "single" ? ["", "", "", ""] : q.options
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
                  className="px-2 py-1 bg-red-700 text-white rounded-lg"
                >
                  Remove
                </button>
              </div>
            </div>

            <input
              placeholder="Prompt"
              value={q.prompt}
              onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
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
                            updateQuestion(q.id, { correctIndexes: Array.from(arr) });
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
                  onChange={(e) => updateQuestion(q.id, { textAnswer: e.target.value })}
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
            className="px-4 py-1 bg-emerald-600 text-white rounded-lg"
          >
            + Add question
          </button>
        </div>
      </div>

      {error && <div className="text-red-700">{error}</div>}
      {success && <div className="text-green-700">{success}</div>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-teal-600 text-white rounded-lg"
        >
          {loading ? "Saving..." : "Save quiz"}
        </button>
      </div>
    </form>
  );
};

export default AddQuizForm;
