import { useEffect, useState } from "react";
import api from "../api/axios";

export default function History() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/tests/history")
      .then(({ data }) => setResults(data))
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap">Loading history...</div>;
  if (error) return <div className="empty-state">{error}</div>;

  return (
    <div>
      <div className="heading">
        <h1>MY TEST HISTORY</h1>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">
          No attempts yet. Head to the dashboard and take your first mock test!
        </div>
      ) : (
        <div className="history-table-wrap">
          <table className="history-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Date</th>
                <th>Score</th>
                <th>Attempted</th>
                <th>Correct</th>
                <th>Wrong</th>
                <th>Time Taken</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id}>
                  <td>{r.subjectName}</td>
                  <td>{new Date(r.createdAt).toLocaleString()}</td>
                  <td>{r.score}</td>
                  <td>
                    {r.attempted} / {r.totalQuestions}
                  </td>
                  <td>{r.correct}</td>
                  <td>{r.wrong}</td>
                  <td>
                    {Math.floor(r.timeTakenSeconds / 60)}m {r.timeTakenSeconds % 60}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
