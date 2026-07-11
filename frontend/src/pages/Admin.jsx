import { useEffect, useState } from "react";
import api from "../api/axios";

const emptySubjectForm = {
  slug: "",
  name: "",
  category: "subject",
  questionsPerTest: 50,
  timeLimitMinutes: 45,
  negativeMarking: 0.25,
};

const emptyQuestionForm = { text: "", options: ["", "", "", ""], correctIndex: 0 };

export default function Admin() {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState(emptySubjectForm);
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const [questions, setQuestions] = useState([]);
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [message, setMessage] = useState("");

  const loadSubjects = () => {
    api.get("/subjects").then(({ data }) => setSubjects(data));
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadQuestions = (subjectId, pageNum = 1) => {
    api
      .get(`/questions/subject/${subjectId}?page=${pageNum}&limit=20`)
      .then(({ data }) => {
        setQuestions(data.questions);
        setPage(data.page);
        setPages(data.pages);
      });
  };

  const selectSubject = (s) => {
    setSelectedSubject(s);
    loadQuestions(s._id, 1);
    setEditingQuestionId(null);
    setQuestionForm(emptyQuestionForm);
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubjectId) {
        await api.put(`/subjects/${editingSubjectId}`, subjectForm);
        setMessage("Subject updated");
      } else {
        await api.post("/subjects", subjectForm);
        setMessage("Subject created");
      }
      setSubjectForm(emptySubjectForm);
      setEditingSubjectId(null);
      loadSubjects();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save subject");
    }
  };

  const editSubject = (s) => {
    setEditingSubjectId(s._id);
    setSubjectForm({
      slug: s.slug,
      name: s.name,
      category: s.category,
      questionsPerTest: s.questionsPerTest,
      timeLimitMinutes: s.timeLimitMinutes,
      negativeMarking: s.negativeMarking,
    });
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Delete this subject and all its questions?")) return;
    await api.delete(`/subjects/${id}`);
    if (selectedSubject?._id === id) setSelectedSubject(null);
    loadSubjects();
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...questionForm, subject: selectedSubject._id };
    try {
      if (editingQuestionId) {
        await api.put(`/questions/${editingQuestionId}`, payload);
        setMessage("Question updated");
      } else {
        await api.post("/questions", payload);
        setMessage("Question added");
      }
      setQuestionForm(emptyQuestionForm);
      setEditingQuestionId(null);
      loadQuestions(selectedSubject._id, page);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save question");
    }
  };

  const editQuestion = (q) => {
    setEditingQuestionId(q._id);
    setQuestionForm({ text: q.text, options: q.options, correctIndex: q.correctIndex });
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    await api.delete(`/questions/${id}`);
    loadQuestions(selectedSubject._id, page);
  };

  const updateOption = (i, value) => {
    const opts = [...questionForm.options];
    opts[i] = value;
    setQuestionForm({ ...questionForm, options: opts });
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      {message && <div className="success-banner">{message}</div>}

      <h2>Subjects</h2>
      <form onSubmit={handleSubjectSubmit} style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <input
          placeholder="slug (e.g. anatomy)"
          value={subjectForm.slug}
          onChange={(e) => setSubjectForm({ ...subjectForm, slug: e.target.value })}
          required
        />
        <input
          placeholder="Name"
          value={subjectForm.name}
          onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
          required
        />
        <select
          value={subjectForm.category}
          onChange={(e) => setSubjectForm({ ...subjectForm, category: e.target.value })}
        >
          <option value="subject">Subject</option>
          <option value="pyq">PYQ Paper</option>
        </select>
        <input
          type="number"
          placeholder="Questions/test"
          value={subjectForm.questionsPerTest}
          onChange={(e) => setSubjectForm({ ...subjectForm, questionsPerTest: +e.target.value })}
        />
        <input
          type="number"
          placeholder="Time limit (min)"
          value={subjectForm.timeLimitMinutes}
          onChange={(e) => setSubjectForm({ ...subjectForm, timeLimitMinutes: +e.target.value })}
        />
        <input
          type="number"
          step="0.05"
          placeholder="Negative marking"
          value={subjectForm.negativeMarking}
          onChange={(e) => setSubjectForm({ ...subjectForm, negativeMarking: +e.target.value })}
        />
        <button className="btn" type="submit">
          {editingSubjectId ? "Update Subject" : "Add Subject"}
        </button>
        {editingSubjectId && (
          <button
            type="button"
            className="btn"
            onClick={() => {
              setEditingSubjectId(null);
              setSubjectForm(emptySubjectForm);
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="admin-table-wrap">
        <table className="history-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Category</th>
              <th>Q/Test</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.slug}</td>
                <td>{s.category}</td>
                <td>{s.questionsPerTest}</td>
                <td>{s.timeLimitMinutes}m</td>
                <td>
                  <button className="small-btn edit" onClick={() => selectSubject(s)}>
                    Manage Qs
                  </button>
                  <button className="small-btn edit" onClick={() => editSubject(s)}>
                    Edit
                  </button>
                  <button className="small-btn delete" onClick={() => deleteSubject(s._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSubject && (
        <>
          <h2 style={{ marginTop: "40px" }}>Questions — {selectedSubject.name}</h2>

          <form onSubmit={handleQuestionSubmit} style={{ marginBottom: "20px" }}>
            <div className="form-group">
              <label>Question text</label>
              <input
                value={questionForm.text}
                onChange={(e) => setQuestionForm({ ...questionForm, text: e.target.value })}
                required
              />
            </div>
            {questionForm.options.map((opt, i) => (
              <div className="form-group" key={i}>
                <label>
                  Option {i + 1}{" "}
                  <input
                    type="radio"
                    name="correctIndex"
                    checked={questionForm.correctIndex === i}
                    onChange={() => setQuestionForm({ ...questionForm, correctIndex: i })}
                  />{" "}
                  correct
                </label>
                <input value={opt} onChange={(e) => updateOption(i, e.target.value)} required />
              </div>
            ))}
            <button className="btn" type="submit">
              {editingQuestionId ? "Update Question" : "Add Question"}
            </button>
            {editingQuestionId && (
              <button
                type="button"
                className="btn"
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  setEditingQuestionId(null);
                  setQuestionForm(emptyQuestionForm);
                }}
              >
                Cancel
              </button>
            )}
          </form>

          <div className="admin-table-wrap">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Correct Answer</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q._id}>
                    <td>{q.text}</td>
                    <td>{q.options[q.correctIndex]}</td>
                    <td>
                      <button className="small-btn edit" onClick={() => editQuestion(q)}>
                        Edit
                      </button>
                      <button className="small-btn delete" onClick={() => deleteQuestion(q._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: "10px", margin: "10px 0 40px 0" }}>
            <button
              className="btn"
              disabled={page <= 1}
              onClick={() => loadQuestions(selectedSubject._id, page - 1)}
            >
              Previous
            </button>
            <span>
              Page {page} of {pages}
            </span>
            <button
              className="btn"
              disabled={page >= pages}
              onClick={() => loadQuestions(selectedSubject._id, page + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
