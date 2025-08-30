const express = require("express");
const app = express();
const cors = require("cors");

require("dotenv").config();

const { User, Exercise } = require("./db/models");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Serve HTML file
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// create user
app.post("/api/users", async (req, res) => {
  console.log("POST /api/users body:", req.body);
  const username = req.body.username;
  if (!username || username.trim() === "") {
    return res.status(400).json({ error: "Username is required" });
  }
  const user = new User({ username: username.trim() });
  const savedUser = await user.save();
  res.json({ _id: savedUser._id.toString(), username: savedUser.username });
});

// list users
app.get("/api/users", async (req, res) => {
  try {
    const userList = await User.find({}, "username _id").exec(); // Only return username and _id
    res
      .status(200)
      .json(
        userList.map((u) => ({ username: u.username, _id: u._id.toString() }))
      );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// create exercise
app.post("/api/users/:_id/exercises", async (req, res) => {
  console.log(`POST /api/${req.params._id}/exercises body:`, req.body);
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const description = req.body.description;
    const duration = parseInt(req.body.duration);
    let date = req.body.date ? new Date(req.body.date) : new Date();

    const exercise = new Exercise({
      userId: user._id,
      description,
      duration,
      date,
    });

    const savedExercise = await exercise.save();

    res.json({
      username: user.username,
      description: savedExercise.description,
      duration: savedExercise.duration,
      date: savedExercise.date.toDateString(),
      _id: user._id.toString(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user Logs
app.get("/api/users/:_id/logs", async (req, res) => {
  console.log(`POST /api/${req.params._id}/logs body:`, req.body);
  try {
    const user = await User.findById(req.params._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    let filter = { userId: user._id };

    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }

    let query = Exercise.find(filter);
    if (req.query.limit) query = query.limit(parseInt(req.query.limit));

    const exercises = await query.exec();

    res.json({
      username: user.username,
      count: exercises.length,
      _id: user._id.toString(),
      log: exercises.map((e) => ({
        description: e.description,
        duration: e.duration,
        date: e.date.toDateString(),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
