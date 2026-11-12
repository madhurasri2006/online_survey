
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
const API = "https://online-survey-4sef.onrender.com/api";

function GetAllDAta() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadFeedback = useCallback(async () => {
    try {
      setError("");
      const res = await axios.get(`${API}/getfeedback`);
      setFeedbacks(res.data);
    } catch {
      setError("Unable to load feedback. Check the backend server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  const getName = item => item.name ?? item.q1 ?? "";
  const getDepartment = item => item.department ?? item.q2 ?? "";
  const getSession = item => item.sessionTitle ?? item.q3 ?? "";
  const getFeedback = item => item.feedback ?? item.q4 ?? "";
  const getSuggestions = item => item.suggestions ?? item.q5 ?? "";

  const filtered = useMemo(() => {
    return feedbacks.filter(item => {
      const text = [
        getName(item),
        getSession(item),
        getFeedback(item)
      ].join(" ").toLowerCase();

      return text.includes(search.toLowerCase()) &&
        (department === "All" || getDepartment(item) === department);
    });
  }, [feedbacks, search, department]);

  const averageRating = feedbacks.length
    ? (
        feedbacks.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) /
        feedbacks.filter(item => Number(item.rating) > 0).length
      )
    : 0;

  const ratedCount = feedbacks.filter(item => Number(item.rating) > 0).length;
  const average = ratedCount
    ? (
        feedbacks.reduce((sum, item) => sum + (Number(item.rating) || 0), 0) /
        ratedCount
      ).toFixed(1)
    : "N/A";

  const departmentCounts = feedbacks.reduce((counts, item) => {
    const name = getDepartment(item) || "Not specified";
    counts[name] = (counts[name] || 0) + 1;
    return counts;
  }, {});

  const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
    label: `${rating} star`,
    count: feedbacks.filter(item => Number(item.rating) === rating).length
  }));

  const deleteFeedback = async id => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      await axios.delete(`${API}/feedback/${id}`);
      setFeedbacks(old => old.filter(item => item._id !== id));
    } catch {
      alert("Could not delete feedback.");
    }
  };

  const exportCSV = () => {
    const columns = [
      "Name", "Department", "Session", "Rating",
      "Recommend", "Favorite Topic", "Feedback", "Suggestions"
    ];

    const rows = filtered.map(item => [
      getName(item),
      getDepartment(item),
      getSession(item),
      item.rating ?? "",
      item.recommend ?? "",
      item.favoriteTopic ?? "",
      getFeedback(item),
      getSuggestions(item)
    ]);

    const escapeCSV = value =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const csv = [columns, ...rows]
      .map(row => row.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "survey-feedback.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container dashboard">
      <h1>Survey Dashboard</h1>
      <p className="center">
        <Link to="/">← Back to Survey Form</Link>
      </p>

      {loading && <p>Loading feedback...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <>
          <div className="stats">
            <div className="stat-card">
              <span>Total Responses</span>
              <strong>{feedbacks.length}</strong>
            </div>
            <div className="stat-card">
              <span>Average Rating</span>
              <strong>{average} / 5</strong>
            </div>
            <div className="stat-card">
              <span>Would Recommend</span>
              <strong>
                {feedbacks.filter(item => item.recommend === "Yes").length}
              </strong>
            </div>
          </div>

          <h2>Responses by Department</h2>
          {Object.keys(departmentCounts).length === 0 && (
            <p>No department data yet.</p>
          )}
          {Object.entries(departmentCounts).map(([name, count]) => (
            <div className="chart-row" key={name}>
              <span>{name}</span>
              <div className="bar-track">
                <div
                  className="bar"
                  style={{
                    width: `${(count / feedbacks.length) * 100}%`
                  }}
                />
              </div>
              <strong>{count}</strong>
            </div>
          ))}

          <h2>Rating Summary</h2>
          {ratingCounts.map(item => (
            <div className="chart-row" key={item.label}>
              <span>{item.label}</span>
              <div className="bar-track">
                <div
                  className="bar"
                  style={{
                    width: `${
                      feedbacks.length
                        ? (item.count / feedbacks.length) * 100
                        : 0
                    }%`
                  }}
                />
              </div>
              <strong>{item.count}</strong>
            </div>
          ))}

          <div className="list-heading">
            <h2>All Feedback</h2>
            <button type="button" onClick={exportCSV}>
              Export CSV
            </button>
          </div>

          <div className="filters">
            <input
              placeholder="Search name, session or feedback..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
            >
              <option value="All">All Departments</option>
              {[...new Set(feedbacks.map(getDepartment).filter(Boolean))]
                .map(name => <option key={name}>{name}</option>)}
            </select>
          </div>

          <p>{filtered.length} response(s) found</p>

          {filtered.length === 0 && <p>No matching feedback found.</p>}

          {filtered.map(item => (
            <div className="feedback-card" key={item._id}>
              <h3>{getName(item) || "Anonymous"}</h3>
              <p><b>Department:</b> {getDepartment(item) || "Not specified"}</p>
              <p><b>Session:</b> {getSession(item) || "Not specified"}</p>
              <p><b>Session Type:</b> {item.questionType || "Not specified"}</p>
              <p><b>Favorite Topic:</b> {item.favoriteTopic || "Not specified"}</p>
              <p><b>Rating:</b> {item.rating ? `${item.rating}/5` : "Not rated"}</p>
              <p><b>Recommend:</b> {item.recommend || "Not answered"}</p>
              <p><b>Feedback:</b> {getFeedback(item)}</p>
              <p><b>Suggestions:</b> {getSuggestions(item) || "None"}</p>
              <p className="date">
                <b>Submitted:</b>{" "}
                {item.submittedAt
                  ? new Date(item.submittedAt).toLocaleString()
                  : "Date unavailable"}
              </p>

              <div className="actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/", { state: { editFeedback: item } })
                  }
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => deleteFeedback(item._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default GetAllDAta;
