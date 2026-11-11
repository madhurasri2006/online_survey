
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.log("MongoDB connection error:", err));

const feedbackSchema = new mongoose.Schema({
  // New field names
  name: String,
  department: String,
  sessionTitle: String,
  questionType: String,
  favoriteTopic: String,
  rating: { type: Number, min: 1, max: 5 },
  recommend: String,
  feedback: String,
  suggestions: String,

  // Keep older records compatible
  q1: String,
  q2: String,
  q3: String,
  q4: String,
  q5: String,

  submittedAt: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

// Get all feedback
app.get("/api/getfeedback", async (req, res) => {
  try {
    const data = await Feedback.find().sort({ submittedAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Could not retrieve feedback" });
  }
});

// Add feedback
app.post("/api/feedback", async (req, res) => {
  try {
    const data = await Feedback.create(req.body);
    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ message: "Could not save feedback" });
  }
});

// Update feedback
app.put("/api/feedback/:id", async (req, res) => {
  try {
    const data = await Feedback.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: "Could not update feedback" });
  }
});

// Delete feedback
app.delete("/api/feedback/:id", async (req, res) => {
  try {
    const data = await Feedback.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Could not delete feedback" });
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});