import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/subjects")
      .then(({ data }) => setSubjects(data))
      .catch(() => setError("Failed to load subjects"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap">Loading dashboard...</div>;
  if (error) return <div className="empty-state">{error}</div>;

  const pyqs = subjects.filter((s) => s.category === "pyq");
  const topics = subjects.filter((s) => s.category === "subject");

  const Card = ({ subject }) => (
    <div className="card">
      <div>
        <h2>{subject.name}</h2>
        <div className="meta">
          {subject.questionsPerTest} Questions &bull; {subject.timeLimitMinutes} min &bull; -
          {subject.negativeMarking} per wrong answer
        </div>
      </div>
      <Link to={`/test/${subject.slug}`} className="btn">
        Start Test
      </Link>
    </div>
  );

  return (
    <div>
      <div className="heading">
        <h1>WEST BENGAL JOINT ENTRANCE EXAMINATION FOR POST BASIC NURSING</h1>
        <h2>DASHBOARD</h2>
      </div>

      {pyqs.length > 0 && (
        <>
          <h3 className="section-title">Previous Year Question Papers</h3>
          <div className="container">
            {pyqs.map((s) => (
              <Card key={s._id} subject={s} />
            ))}
          </div>
        </>
      )}

      {topics.length > 0 && (
        <>
          <h3 className="section-title">Subject-wise Practice Tests</h3>
          <div className="container">
            {topics.map((s) => (
              <Card key={s._id} subject={s} />
            ))}
          </div>
        </>
      )}

      {subjects.length === 0 && (
        <div className="empty-state">
          No subjects found yet. Run <code>npm run seed</code> in the backend to load the question
          bank.
        </div>
      )}
    </div>
  );
}
