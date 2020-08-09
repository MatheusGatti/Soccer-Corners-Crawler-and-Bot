const axios = require("axios");
const cheerio = require("cheerio");
const requireDir = require("require-dir");
const sqlite3 = require("sqlite3");
const prompt = require("prompt-sync")();
const moment = require("moment-timezone");

//Create and connect to DB
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.log(err);
  }
});

//Import all models
requireDir("./src/models");

//Import controllers
const GameControler = require("./src/controllers/Game");

//Import Crawler
const Crawler = require("./src/crawler");

//Main
const Main = async () => {
  console.clear();
  console.log("E.g: 28/07/2020");
  const dateAnalyseGames = prompt("Choose a date for analyse the games: ");

  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateAnalyseGames)) {
    console.log("The date is incorrect.");
    return false;
  }
  const CrawlerObj = new Crawler(dateAnalyseGames);
  await CrawlerObj.getGamesId();
  console.log(`[!] ${CrawlerObj.gamesPrevResult.length} game(s) to analyse`);
  await CrawlerObj.analyseGames();
  for (let game of CrawlerObj.gamesResult) {
    let {
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
      awayCornersFt,
    } = game;
    GameControler.store(
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
    );
  }
  console.log("[+] Done");
};

Main();

//Close DB
db.close((err) => {
  if (err) {
    console.log(err);
  }
});
