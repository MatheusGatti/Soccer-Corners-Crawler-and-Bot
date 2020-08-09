const sqlite3 = require("sqlite3");

//Create and connect to DB
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log(err);
  }
});

module.exports = {
  async store(
    gameId,
    gameDate,
    homeName,
    homeId,
    homeAnalyzedGames,
    homeGoalsHt,
    homeGoalsFt,
    homeCornersHt,
    homeCornersFt,
    awayName,
    awayId,
    awayAnalyzedGames,
    awayGoalsHt,
    awayGoalsFt,
    awayCornersHt,
    awayCornersFt
  ) {
    const queryInsert = `INSERT INTO games (gameId,
      gameDate,
      homeName,
      homeId,
      homeAnalyzedGames,
      homeGoalsHt,
      homeGoalsFt,
      homeCornersHt,
      homeCornersFt,
      awayName,
      awayId,
      awayAnalyzedGames,
      awayGoalsHt,
      awayGoalsFt,
      awayCornersHt,
      awayCornersFt) VALUES (${gameId}, "${gameDate}", "${homeName}", ${homeId}, ${homeAnalyzedGames}, ${homeGoalsHt}, ${homeGoalsFt}, ${homeCornersHt}, ${homeCornersFt}, "${awayName}", ${awayId}, ${awayAnalyzedGames}, ${awayGoalsHt}, ${awayGoalsFt}, ${awayCornersHt}, ${awayCornersFt})`;
    db.serialize(() => {
      db.run(queryInsert, (err) => {
        if (err) {
          console.log(err);
          return false;
        }
      });
    });
    return true;
  },

  async destroy(id) {
    const queryDestroy = `DELETE FROM games WHERE id = ${id}`;
    db.serialize(() => {
      db.run(queryDestroy, (err) => {
        if (err) {
          console.log(err);
          return false;
        }
      });
    });
    return true;
  },

  async show(date) {
    return new Promise((resolve, reject) => {
      const queryShow = `SELECT * FROM games WHERE gameDate LIKE "%${date}%"`;
      db.serialize(() => {
        db.all(queryShow, (err, rows) => {
          if (err) {
            console.log(err);
            reject(false);
          }
          resolve(rows);
        });
      });
    });
  },

  async index(id) {
    return new Promise((resolve, reject) => {
      const queryIndex = `SELECT * FROM games WHERE id = ${id}`;
      db.serialize(() => {
        db.get(queryIndex, (err, row) => {
          if (err) {
            console.log(err);
            reject(false);
          }
          resolve(row);
        });
      });
    });
  },
};
