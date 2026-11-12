
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
const API = "https://online-survey-4sef.onrender.com/api";
const emptyForm = {
  name: "",
  department: "",
  sessionTitle: "",
  questionType: "",
  favoriteTopic: "",
  rating: "5",
  recommend: "",
  feedback: "",
  suggestions: ""
};

function App() {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const item = location.state?.editFeedback;

    if (item) {
      setEditingId(item._id);
      setForm({
        name: item.name ?? item.q1 ?? "",
        department: item.department ?? item.q2 ?? "",
        sessionTitle: item.sessionTitle ?? item.q3 ?? "",
        questionType: item.questionType ?? "",
        favoriteTopic: item.favoriteTopic ?? "",
        rating: String(item.rating ?? 5),
        recommend: item.recommend ?? "",
        feedback: item.feedback ?? item.q4 ?? "",
        suggestions: item.suggestions ?? item.q5 ?? ""
      });
    }
  }, [location.state]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      ...form,
      rating: Number(form.rating),

      // Keep compatibility with older records
      q1: form.name,
      q2: form.department,
      q3: form.sessionTitle,
      q4: form.feedback,
      q5: form.suggestions
    };

    try {
      if (editingId) {
        await axios.put(
          `${API}/feedback/${editingId}`,
          data
        );
        alert("Feedback updated successfully!");
      } else {
        await axios.post(`${API}/feedback`, data);
        alert("Feedback submitted successfully!");
      }

      setForm(emptyForm);
      setEditingId("");
      navigate("/getAllData");
    } catch (error) {
      alert(error.response?.data?.message || "Could not save feedback.");
    }
  };

  return (
    <div className="container">
      <h1>Online Survey Application</h1>
      <h3>{editingId ? "Edit Feedback" : "Feedback Survey"}</h3>

      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <label>Department</label>
        <select
          name="department"
          value={form.department}
          onChange={handleChange}
          required
        >
          <option value="">Select department</option>
          <option>IT</option>
          <option>CSE</option>
          <option>ECE</option>
          <option>EEE</option>
          <option>Mechanical</option>
          <option>Other</option>
        </select>

        <label>Session Title</label>
        <input
          name="sessionTitle"
          value={form.sessionTitle}
          onChange={handleChange}
          required
        />

        <label>Question 1: What type of session did you attend?</label>
        <select
          name="questionType"
          value={form.questionType}
          onChange={handleChange}
          required
        >
          <option value="">Choose an option</option>
          <option>Workshop</option>
          <option>Seminar</option>
          <option>Technical Training</option>
          <option>Other</option>
        </select>

        <label>Question 2: Which topic did you like most?</label>
        <div className="choice-group">
          {["Programming", "Data Science", "Web Development", "AI"].map(
            topic => (
              <label className="choice" key={topic}>
                <input
                  type="radio"
                  name="favoriteTopic"
                  value={topic}
                  checked={form.favoriteTopic === topic}
                  onChange={handleChange}
                  required
                />
                {topic}
              </label>
            )
          )}
        </div>

        <label>Question 3: Rate the session (1–5)</label>
        <select
          name="rating"
          value={form.rating}
          onChange={handleChange}
          required
        >
          <option value="1">1 - Poor</option>
          <option value="2">2 - Fair</option>
          <option value="3">3 - Good</option>
          <option value="4">4 - Very Good</option>
          <option value="5">5 - Excellent</option>
        </select>

        <label>Question 4: Would you recommend this session?</label>
        <div className="choice-group">
          {["Yes", "No"].map(answer => (
            <label className="choice" key={answer}>
              <input
                type="radio"
                name="recommend"
                value={answer}
                checked={form.recommend === answer}
                onChange={handleChange}
                required
              />
              {answer}
            </label>
          ))}
        </div>

        <label>What did you learn from this session?</label>
        <textarea
          name="feedback"
          value={form.feedback}
          onChange={handleChange}
          required
        />

        <label>Suggestions for improvement</label>
        <textarea
          name="suggestions"
          value={form.suggestions}
          onChange={handleChange}
        />

        <button type="submit">
          {editingId ? "Update Feedback" : "Submit Feedback"}
        </button>

        {editingId && (
          <button
            type="button"
            className="secondary"
            onClick={() => {
              setForm(emptyForm);
              setEditingId("");
              navigate("/");
            }}
          >
            Cancel Edit
          </button>
        )}
      </form>

      <p><Link to="/getAllData">Open Dashboard and Feedback List</Link></p>
    </div>
  );
}

export default App;
