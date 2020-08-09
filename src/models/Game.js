const sqlite3 = require("sqlite3");

//Create and connect to DB
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log(err);
  }
});

const GamesSchema = `CREATE TABLE IF NOT EXISTS games (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gameId INTEGER NOT NULL,
  gameDate DATETIME NOT NULL,
  homeName TEXT NOT NULL,
  homeId INTEGER NOT NULL,
  homeAnalyzedGames INTEGER NOT NULL,
  homeGoalsHt INTEGER NOT NULL,
  homeGoalsFt INTEGER NOT NULL,
  homeCornersHt INTEGER NOT NULL,
  homeCornersFt INTEGER NOT NULL,
  awayName TEXT NOT NULL,
  awayId INTEGER NOT NULL,
  awayAnalyzedGames INTEGER NOT NULL,
  awayGoalsHt INTEGER NOT NULL,
  awayGoalsFt INTEGER NOT NULL,
  awayCornersHt INTEGER NOT NULL,
  awayCornersFt INTEGER NOT NULL
)`;

db.serialize(() => {
  db.run(GamesSchema, (err) => {
    if (err) {
      console.log(err);
    }
  });
});
