import React, { useEffect, useMemo, useState } from "react";
import type { IQuizApi } from "../../api_services/interfaces/IQuizApi";
import type { QuizDto } from "../../models/quiz";
import EditQuizModal from "./EditQuizModal";

type Props = {
  quizApi: IQuizApi;
  refreshKey?: number;
};

export const ManageQuizzes: React.FC<Props> = ({ quizApi, refreshKey = 0 }) => {
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<QuizDto | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const token = localStorage.getItem("token") ?? "";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizApi.getAllQuizzes(token);
      setQuizzes(data ?? []);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete quiz?")) return;
    setLoading(true);
    try {
      const ok = await quizApi.deleteQuiz(id, token);
      if (ok) await load();
      else setError("Failed to delete");
    } catch {
      setError("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (q: QuizDto) => {
    setEditing(q);
    setModalOpen(true);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    quizzes.forEach((q) => {
      const c = (q.category ?? "").trim();
      if (c) set.add(c);
    });
    return ["all", ...Array.from(set).sort()];
  }, [quizzes]);

  const difficulties = useMemo(() => ["all", "Easy", "Medium", "Hard"], []);

  const filteredQuizzes = useMemo(() => {
    const s = search.trim().toLowerCase();
    return quizzes.filter((q) => {
      if (selectedCategory !== "all" && (q.category ?? "") !== selectedCategory) return false;
      if (selectedDifficulty !== "all" && (q.difficulty ?? "") !== selectedDifficulty) return false;
      if (s && !(q.description ?? "").toLowerCase().includes(s) && !(q.name ?? "").toLowerCase().includes(s))
        return false;
      return true;
    });
  }, [quizzes, search, selectedCategory, selectedDifficulty]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or description..."
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        <div className="flex gap-3 items-center">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "All categories" : c}
              </option>
            ))}
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            {difficulties.map((d) => (
              <option key={d} value={d}>
                {d === "all" ? "All difficulties" : d}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch("");
              setSelectedCategory("all");
              setSelectedDifficulty("all");
            }}
            className="px-3 py-2 bg-slate-200 rounded-lg"
          >
            Reset
          </button>
        </div>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid gap-4">
        {filteredQuizzes.map((q) => (
          <div key={q.id} className="p-4 border rounded-lg bg-white/50 flex items-start justify-between">
            <div>
              <div className="font-semibold">{q.name}</div>
              <div className="text-sm text-gray-600">
                {q.category} • {q.difficulty} • {q.time} sec
              </div>
              <div className="mt-2 text-sm">{q.description}</div>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => openEdit(q)} className="px-3 py-1 bg-blue-600 rounded-lg text-white">
                Edit
              </button>
              <button onClick={() => handleDelete(q.id)} className="px-3 py-1 bg-pink-600 text-white rounded-lg">
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredQuizzes.length === 0 && !loading && <div className="text-gray-500">No quizzes found.</div>}
      </div>

      <EditQuizModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        quiz={editing}
        quizApi={quizApi}
        token={token}
        onSaved={() => load()}
      />
    </div>
  );
};

export default ManageQuizzes;
