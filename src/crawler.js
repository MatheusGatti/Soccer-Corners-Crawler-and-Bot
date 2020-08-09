const moment = require("moment-timezone");
const axios = require("axios");
const cheerio = require("cheerio");

class Crawler {
  constructor(date) {
    this.analyseDate = date;
  }

  async getPage(url) {
    let result = await axios.request({
      url: url,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
      },
    });
    while (result.data.includes("QQ：1562716566")) {
      console.log(
        "[X] You're blocked, change your IP and press any key to continue"
      );
      process.stdin.setRawMode(true);
      process.stdin.resume();
      result = await axios.request({
        url: url,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36",
        },
      });
    }
    return result.data;
  }

  async getGamesId() {
    let [day, month, year] = this.analyseDate.split("/");
    this.analyseDay = day;
    this.analyseMonth = month;
    this.analyseYear = year;
    this.gamesPrevResult = [];
    this.gamesResult = [];
    for (let index = 1; index <= 3; index++) {
      let url = "https://www.scorebing.com/fixtures/p." + index;
      let pageContent = await this.getPage(url);
      let $ = cheerio.load(pageContent);
      if (!pageContent.includes("No match in progress.")) {
        $("#diary_info > table")
          .slice(-1)
          .find("tbody > tr")
          .each((i, e) => {
            let [gameYear, gameMonth, gameDay] = $($(e).find("td")[1])
              .text()
              .split(" ")[0]
              .split("/");
            let gameDate =
              "20" +
              gameYear +
              "-" +
              gameMonth +
              "-" +
              gameDay +
              " " +
              $($(e).find("td")[1]).text().split(" ")[1] +
              ":00";
            gameDate = moment
              .tz(gameDate, "Asia/Hong_Kong")
              .clone()
              .tz("America/Sao_Paulo");
            let gameId = $($($(e).find("td")[15]))
              .find("a")
              .attr("href")
              .replace("/match/", "");
            if (this.analyseDay == gameDate.format("DD")) {
              console.log(`[!] Preparing to analyse the game ${gameId}`);
              this.gamesPrevResult.push({
                gameId,
                gameDate: gameDate.format("YYYY-MM-DD HH:mm:ss"),
              });
            }
          });
      }
    }
  }

  async analyseGames() {
    for (let game of this.gamesPrevResult) {
      console.log(`[!] Analysing the game ${game.gameId}`);
      let url = "https://www.scorebing.com/match_history/" + game.gameId;
      try {
        let pageContent = await this.getPage(url);
        let $ = cheerio.load(pageContent);
        game.homeName = $(
          "body > div > main > div.analysisWrapper > div > div > div > div > div.analysisHead > div > div > h3.analysisTeamName.red-color"
        ).text();
        game.awayName = $(
          "body > div > main > div.analysisWrapper > div > div > div > div > div.analysisHead > div > div > h3.analysisTeamName.blue-color"
        ).text();
        game.homeId = pageContent.match(/home_id\.push\((\d+)\)/)[1];
        game.awayId = pageContent.match(/guest_id\.push\((\d+)\)/)[1];
        let matches = pageContent.match(/race\[\d{1,2}.*\;/gm);
        game.homeGoalsHt = 0;
        game.homeGoalsFt = 0;
        game.homeCornersHt = 0;
        game.homeCornersFt = 0;
        game.homeAnalyzedGames = 0;
        game.awayAnalyzedGames = 0;
        game.awayGoalsHt = 0;
        game.awayGoalsFt = 0;
        game.awayCornersHt = 0;
        game.awayCornersFt = 0;
        for (let match of matches) {
          let matchSplitted = match.split(",");
          if (matchSplitted[4] == game.homeId) {
            if (game.homeAnalyzedGames < 6) {
              game.homeAnalyzedGames += 1;
              game.homeGoalsHt += parseInt(matchSplitted[15].replace("'", ""));
              game.homeGoalsFt += parseInt(matchSplitted[19].replace("'", ""));
              game.homeCornersHt += parseInt(
                matchSplitted[13].replace("'", "")
              );
              game.homeCornersFt += parseInt(
                matchSplitted[17].replace("'", "")
              );
            }
          }
          if (matchSplitted[7] == game.awayId) {
            if (game.awayAnalyzedGames < 6) {
              game.awayAnalyzedGames += 1;
              game.awayGoalsHt += parseInt(matchSplitted[16].replace("'", ""));
              game.awayGoalsFt += parseInt(matchSplitted[20].replace("'", ""));
              game.awayCornersHt += parseInt(
                matchSplitted[14].replace("'", "")
              );
              game.awayCornersFt += parseInt(
                matchSplitted[18].replace("'", "")
              );
            }
          }
        }
        this.gamesResult.push(game);
        console.log(`[+] The game ${game.gameId} was analysed successfully`);
      } catch (error) {
        console.log(`[X] Unsuccessful analyse in the game ${game.gameId}`);
        console.log(error);
      }
    }
  }
}

module.exports = Crawler;
