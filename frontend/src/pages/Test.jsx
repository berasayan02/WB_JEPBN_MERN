import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";

export default function Test() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // questionId -> selectedIndex
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // graded result after submit
  const [showPopup, setShowPopup] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState("");

  const startTimeRef = useRef(null);
  const submittedRef = useRef(false);

  // Load a fresh randomized test on mount
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .get(`/tests/${slug}/start`)
      .then(({ data }) => {
        if (cancelled) return;
        setSubject(data.subject);
        setQuestions(data.questions);
        setTimeLeft(data.subject.timeLimitMinutes * 60);
        startTimeRef.current = Date.now();
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || "Failed to load test");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleSubmit = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);

    const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const payload = {
      answers: questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] !== undefined ? answers[q.id] : null,
      })),
      timeTakenSeconds,
    };

    try {
      const { data } = await api.post(`/tests/${slug}/submit`, payload);
      setResult(data);
      setShowPopup(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit test");
      submittedRef.current = false;
    } finally {
      setSubmitting(false);
    }
  }, [answers, questions, slug]);

  // Countdown timer
  useEffect(() => {
    if (loading || !subject || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, loading, subject, result, handleSubmit]);

  // Warn before leaving mid-test
  useEffect(() => {
    const handler = (e) => {
      if (!result) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [result]);

  const selectAnswer = (questionId, index) => {
    if (result) return; // lock after submit
    setAnswers((prev) => ({ ...prev, [questionId]: index }));
  };

  const handleBack = () => {
    if (result || window.confirm("Are you sure you want to go back? Test progress will be lost.")) {
      navigate("/");
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const answerLookup = result
    ? new Map(result.answers.map((a) => [a.question, a]))
    : null;

  if (loading) return <div className="loading-wrap">Loading test...</div>;
  if (error && !subject) return <div className="empty-state">{error}</div>;

  return (
    <div className="quiz-page">
      <button className="back-btn" onClick={handleBack}>
        ⬅ BACK
      </button>

      <div className="quiz-header">
        <h1>🩺 WB JEPBN</h1>
        <h2 style={{ textAlign: "center", color: "#2e7d32" }}>MOCK TEST — {subject.name}</h2>
      </div>

      {!result && (
        <div className={`timer ${timeLeft < 120 ? "low" : ""}`}>
          Time Left: {formatTime(timeLeft)}
        </div>
      )}

      {result && (
        <div className="score-box">
          🎯 Final Score: {result.score}
          <br />
          📝 Attempted: {result.attempted}
          <br />
          ✅ Correct: {result.correct}
          <br />
          ❌ Wrong: {result.wrong}
        </div>
      )}

      {questions.map((q, index) => {
        const graded = answerLookup ? answerLookup.get(q.id) : null;
        return (
          <div className="question" key={q.id}>
            <p className="q-text">
              {index + 1}. {q.text}
            </p>
            {q.options.map((opt, i) => {
              let cls = "";
              if (graded) {
                if (i === graded.correctIndex) cls = "correct";
                else if (i === graded.selectedIndex && !graded.isCorrect) cls = "wrong";
              }
              return (
                <label key={i} className={cls}>
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    value={i}
                    disabled={!!result}
                    checked={answers[q.id] === i}
                    onChange={() => selectAnswer(q.id, i)}
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        );
      })}

      {!result && (
        <button className="submit-btn" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Test"}
        </button>
      )}

      {result && (
        <div className="result-actions">
          <button className="restart-btn" onClick={() => window.location.reload()}>
            🔄 Restart Test
          </button>
          <button className="btn" onClick={() => navigate("/history")}>
            View History
          </button>
        </div>
      )}

      {showPopup && result && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h2>🎯 Your Score: {result.score}</h2>
            <button onClick={() => setShowPopup(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
