import React, { useEffect, useState } from "react";
import AddQuizForm from "../components/admin/AddQuizForm";
import ManageQuizzes from "../components/admin/ManageQuizzess";
import type { IQuizApi } from "../api_services/interfaces/IQuizApi";
import GradientBackground from "../components/layout/GradientBackground";
import type { ResultDto } from "../models/result";
import { useAuth } from "../auth/useAuth";
import type { IResultApi } from "../api_services/interfaces/IResultApi";
import ReviewResultModal from "../components/user/ReviewQuiz";
import GlobalRankingList from "../components/GlobalRankingList";
import Logout from "../components/layout/LogoutButton";

type Props = {
  quizApi: IQuizApi;
  resultApi: IResultApi;
};

const AdminPage: React.FC<Props> = ({ quizApi, resultApi }) => {
  const { token } = useAuth();
  const [results, setResults] = useState<ResultDto[]>([]);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<ResultDto | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const loadResults = async () => {
    setResultsLoading(true);
    setResultsError(null);
    try {
      const data = await resultApi.getAllResults(token ?? "");
      setResults(data ?? []);
    } catch {
      setResultsError("Failed to load results");
    } finally {
      setResultsLoading(false);
    }
  };

  const openReview = (r: ResultDto) => {
    setReviewResult(r);
    setReviewModalOpen(true);
  };

  useEffect(() => {
    loadResults();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <GradientBackground>
      
      <div className="max-w-6xl mx-auto space-y-6">
        <Logout />
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Quiz</h2>
          <AddQuizForm
            quizApi={quizApi}
            onSaved={() => setRefreshKey((k) => k + 1)}
          />
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Manage Quizzes</h2>
          <ManageQuizzes quizApi={quizApi} refreshKey={refreshKey} />
        </div>

        <div className="bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Quiz Results</h2>
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

        <ReviewResultModal
          open={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          result={reviewResult}
          allResults={results}
        />

        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Rank List</h2>
          <GlobalRankingList results={results} />
        </div>
      </div>
    </GradientBackground>
  );
};

export default AdminPage;
