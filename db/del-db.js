const { User, Exercise, Log } = require("./models");

Promise.all([
  User.deleteMany({}),
  Exercise.deleteMany({}),
  // Log.deleteMany({}),
]).then(() => {
  console.log("Database cleared");
});
