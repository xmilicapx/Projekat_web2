import { useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { ResultDto } from "../models/result";

type TimePeriod = "all" | "weekly" | "monthly";

interface ScoredResult extends ResultDto {
  score: number;
}

function filterByPeriod(results: ResultDto[], period: TimePeriod): ResultDto[] {
  if (period === "all") return results;

  const now = new Date();
  return results.filter((r) => {
    const done = new Date(r.quizDone);
    const diffDays = (now.getTime() - done.getTime()) / (1000 * 60 * 60 * 24);
    return period === "weekly" ? diffDays <= 7 : diffDays <= 30;
  });
}

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
        if (a1.length === a2.length && a1.every((v, i) => v === a2[i])) {
          correctCount++;
        }
      } else if (String(correct) === String(userAnswer)) {
        correctCount++;
      }
    });

    return Math.round((correctCount / parsed.length) * 100);
  } catch {
    return 0;
  }
}

type GlobalRankingListProps = {
  results: ResultDto[];
};

export default function GlobalRankingList({ results }: GlobalRankingListProps) {
  const { user } = useAuth();
  const currentUsername = user?.username;

  const [selectedQuiz, setSelectedQuiz] = useState<string>("all");
  const [period, setPeriod] = useState<TimePeriod>("all");

  const filtered = useMemo(() => {
    let res = filterByPeriod(results, period);
    if (selectedQuiz !== "all") {
      res = res.filter((r) => r.quizName === selectedQuiz);
    }
    return res;
  }, [results, selectedQuiz, period]);

  const rankings = useMemo(() => {
    const grouped = new Map<string, Map<string, ScoredResult>>();

    filtered.forEach((r) => {
      const score = calculateScore(r);
      const scoredResult: ScoredResult = { ...r, score };

      if (!grouped.has(r.quizName)) {
        grouped.set(r.quizName, new Map());
      }

      const quizMap = grouped.get(r.quizName)!;
      const existing = quizMap.get(r.username);

      if (
        !existing ||
        scoredResult.score > existing.score ||
        (scoredResult.score === existing.score &&
          new Date(scoredResult.quizDone) < new Date(existing.quizDone))
      ) {
        quizMap.set(r.username, scoredResult);
      }
    });

    const result: Record<string, ScoredResult[]> = {};

    for (const [quiz, userMap] of grouped.entries()) {
      const sorted = Array.from(userMap.values()).sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.quizDone).getTime() - new Date(b.quizDone).getTime();
      });

      result[quiz] = sorted;
    }

    return result;
  }, [filtered]);

  const quizOptions = useMemo(() => {
    const unique = new Set(results.map((r) => r.quizName));
    return Array.from(unique);
  }, [results]);

  return (
    <div className="max-w-5xl mx-auto py-2">
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={selectedQuiz}
          onChange={(e) => setSelectedQuiz(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All quizzes</option>
          {quizOptions.map((q) => (
            <option key={q} value={q}>
              {q}
            </option>
          ))}
        </select>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as TimePeriod)}
          className="border border-gray-300 rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All time</option>
          <option value="weekly">This week</option>
          <option value="monthly">This month</option>
        </select>
      </div>

      {Object.entries(rankings).map(([quiz, list]) => (
        <div key={quiz} className="mb-10">
          <h3 className="text-2xl font-bold text-emerald-700 mb-4">
            <span className="text-emerald-900">{quiz}</span>
          </h3>

          <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 bg-white">
              <thead className="bg-emerald-100">
                <tr>
                  <th className="px-3 py-1 text-left text-sm font-semibold text-emerald-700 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-3 py-1 text-left text-sm font-semibold text-emerald-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-3 py-1 text-left text-sm font-semibold text-emerald-700 uppercase tracking-wider">
                    Score (%)
                  </th>
                  <th className="px-3 py-1 text-left text-sm font-semibold text-emerald-700 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map((r, i) => (
                  <tr
                    key={r.id}
                    className={`${
                      r.username === currentUsername
                        ? " font-semibold"
                        : ""
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <td className="px-3 py-1">{i + 1}</td>
                    <td className="px-3 py-1">{r.username}</td>
                    <td className="px-3 py-1">{r.score}</td>
                    <td className="px-3 py-1">
                      {new Date(r.quizDone).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
