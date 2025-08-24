import React, { useEffect, useMemo, useState } from "react";
import type { IQuizApi } from "../api_services/interfaces/IQuizApi";
import type { IResultApi } from "../api_services/interfaces/IResultApi";
import type { QuizDto } from "../models/quiz";
import type { ResultDto } from "../models/result";
import { useAuth } from "../auth/useAuth";
import PlayQuizModal from "../components/user/PlayQuiz";
import GradientBackground from "../components/layout/GradientBackground";
import ReviewResultModal from "../components/user/ReviewQuiz";
import GlobalRankingList from "../components/GlobalRankingList";
import Logout from "../components/layout/LogoutButton";

type Props = {
  quizApi: IQuizApi;
  resultApi: IResultApi;
};

const UserPage: React.FC<Props> = ({ quizApi, resultApi }) => {
  const [quizzes, setQuizzes] = useState<QuizDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playQuiz, setPlayQuiz] = useState<QuizDto | null>(null);
  const [playModalOpen, setPlayModalOpen] = useState(false);
  const [results, setResults] = useState<ResultDto[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<ResultDto | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const { token, user } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const loadQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await quizApi.getAllQuizzes(token ?? "");
      setQuizzes(data ?? []);
    } catch {
      setError("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    if (!user) return;
    setResultsLoading(true);
    setResultsError(null);
    try {
      const data = await resultApi.getAllUserResultsByUsername(
        user.username,
        token ?? ""
      );
      setResults(data ?? []);
    } catch {
      setResultsError("Failed to load results");
    } finally {
      setResultsLoading(false);
    }
  };

  useEffect(() => {
    loadQuizzes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
      loadResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

  const openPlay = (q: QuizDto) => {
    setPlayQuiz(q);
    setPlayModalOpen(true);
  };

  const openReview = (r: ResultDto) => {
    setReviewResult(r);
    setReviewModalOpen(true);
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
      if (selectedCategory !== "all" && (q.category ?? "") !== selectedCategory)
        return false;
      if (
        selectedDifficulty !== "all" &&
        (q.difficulty ?? "") !== selectedDifficulty
      )
        return false;
      if (
        s &&
        !(q.description ?? "").toLowerCase().includes(s) &&
        !(q.name ?? "").toLowerCase().includes(s)
      )
        return false;
      return true;
    });
  }, [quizzes, search, selectedCategory, selectedDifficulty]);

  return (
    <GradientBackground>
      <div className="max-w-6xl mx-auto space-y-6">
        <Logout />
        <div className="bg-white rounded-2xl shadow p-6">
          <div className=" md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <h2 className="text-xl font-semibold mb-4">Quizzes</h2>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description..."
                className="px-3 py-2 border rounded-lg w-full md:w-80"
              />

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

          <div className="space-y-3">
            {loading && <div>Loading...</div>}
            {error && <div className="text-red-600">{error}</div>}
            <div className="grid gap-4">
              {filteredQuizzes.map((q) => (
                <div
                  key={q.id}
                  className="p-4 border rounded-lg bg-white/50 flex items-start justify-between"
                >
                  <div>
                    <div className="font-semibold">{q.name}</div>
                    <div className="text-sm text-gray-600">
                      {q.category} • {q.difficulty} • {q.time} sec
                    </div>
                    <div className="mt-2 text-sm">{q.description}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => openPlay(q)}
                      className="px-3 py-1 bg-teal-600 text-white rounded-lg"
                    >
                      Play
                    </button>
                  </div>
                </div>
              ))}
              {filteredQuizzes.length === 0 && !loading && (
                <div className="text-gray-500">No quizzes available.</div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">My Results</h2>
            <button
              onClick={() => loadResults()}
              className="px-3 py-1 bg-slate-200 rounded-lg"
            >
              Refresh
            </button>
          </div>

          {resultsLoading && <div>Loading results...</div>}
          {resultsError && <div className="text-red-600">{resultsError}</div>}

          <div className="space-y-3">
            {results.length === 0 && !resultsLoading && (
              <div className="text-gray-500">No results yet.</div>
            )}
            <div className="grid gap-3">
              {results.map((r) => (
                <div
                  key={r.id}
                  className="p-3 border rounded-lg flex items-center justify-between bg-white/50"
                >
                  <div>
                    <div className="font-medium">{r.quizName}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(r.quizDone).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openReview(r)}
                      className="px-3 py-1 bg-emerald-600 rounded-lg text-white"
                    >
                      Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Rank List</h2>
          <GlobalRankingList results={results} />
        </div>
      </div>

      <PlayQuizModal
        open={playModalOpen}
        onClose={() => setPlayModalOpen(false)}
        quiz={playQuiz}
        resultApi={resultApi}
        token={token ?? ""}
      />

      <ReviewResultModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        result={reviewResult}
        allResults={results}
      />
    </GradientBackground>
  );
};

export default UserPage;
