const { Telegraf } = require("telegraf");
const requireDir = require("require-dir");
const sqlite3 = require("sqlite3");
const moment = require("moment-timezone");

//Set default timezone
process.env.TZ = "America/Sao_Paulo";

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
const Game = require("./src/controllers/Game");

//Bot token
//Put your telegram bot token here
const token = "";

//Bot instance
const bot = new Telegraf(token);

//Command /comandos
bot.command("comandos", (ctx) => {
  try {
    console.log(
      `${ctx.message.from.username} (${ctx.message.from.first_name}) -> Comando utilizado: /comandos`
    );
  } catch (error) {
    console.log(error);
  }
  return ctx.reply(`👋 Olá ${
    ctx.message.from.first_name
  }, abaixo você verá todos meus comandos:


👉 /comandos ➖ Mostrarei todos os comandos com exemplos de como usá-los.

👉 /hoje ➖ Mostrarei todos os jogos que aconteceram e irão acontecer hoje (${moment().format(
    "DD/MM/YYYY"
  )}).

👉 /amanha ➖ Mostrarei todos os jogos que irão acontecer amanhã (${moment()
    .add(1, "d")
    .format("DD/MM/YYYY")}).

👉 /jogo ID ➖ Eu irei disponibilizar junto a cada jogo uma identificação (ID) que se trata de um número que servirá para você pesquisar as estatísticas desse jogo utilizando este comando. No lugar de ID coloque a identificação do jogo, como por exemplo: (120) Flamengo x Fluminense, o ID do jogo é 120, logo utilizarei /jogo 120 para ver as estatísticas do mesmo.`);
});

//Command /hoje
bot.command("hoje", (ctx) => {
  try {
    console.log(
      `${ctx.message.from.username} (${ctx.message.from.first_name}) -> Comando utilizado: /hoje`
    );
  } catch (error) {
    console.log(error);
  }
  const todayDate = moment().format("YYYY-MM-DD");
  GameControler.show(todayDate).then((rows) => {
    if (rows.length === 0) {
      return ctx.reply("😔 Infelizmente não tenho os jogos de hoje.");
    }
    for (
      let index = 0;
      index <= Math.ceil(rows.length / 10) * 10;
      index += 10
    ) {
      let newRows = rows.slice(index, index + 10);
      let message = ``;
      for (let index in newRows) {
        let game = newRows[index];
        message += `⚽️ Jogo ${game.id}\n🏠 ${game.homeName} x 🏃 ${
          game.awayName
        }\n🗓 ${moment(game.gameDate).format("DD/MM/YYYY HH:mm")}\n\n`;
      }
      if (newRows.length !== 0) {
        ctx.reply(message);
      }
    }
  });
  return;
});

//Command /amanha
bot.command("amanha", (ctx) => {
  try {
    console.log(
      `${ctx.message.from.username} (${ctx.message.from.first_name}) -> Comando utilizado: /amanha`
    );
  } catch (error) {
    console.log(error);
  }
  const tomorrowDate = moment().add(1, "d").format("YYYY-MM-DD");
  GameControler.show(tomorrowDate).then((rows) => {
    if (rows.length === 0) {
      return ctx.reply("😔 Infelizmente não tenho os jogos de amanhã.");
    }
    for (
      let index = 0;
      index <= Math.ceil(rows.length / 10) * 10;
      index += 10
    ) {
      let newRows = rows.slice(index, index + 10);
      let message = ``;
      for (let index in newRows) {
        let game = newRows[index];
        message += `⚽️ Jogo ${game.id}\n🏠 ${game.homeName} x 🏃 ${
          game.awayName
        }\n🗓 ${moment(game.gameDate).format("DD/MM/YYYY HH:mm")}\n\n`;
      }
      if (newRows.length !== 0) {
        ctx.reply(message);
      }
    }
  });
  return;
});

//Command /jogo ID
bot.command("jogo", (ctx) => {
  try {
    console.log(
      `${ctx.message.from.username} (${ctx.message.from.first_name}) -> Comando utilizado: /jogo`
    );
  } catch (error) {
    console.log(error);
  }
  try {
    const gameId = parseInt(
      ctx.message.text.replace("/jogo ", "").split(" ")[0].trim()
    );
    if (Number.isInteger(gameId)) {
      GameControler.index(gameId).then((row) => {
        if (row === undefined) {
          return ctx.reply(`🙄 O jogo ${gameId} não foi encontrado.`);
        }
        let message = `⚽️ ${row.id} - 🏠 ${row.homeName} x 🏃 ${
          row.awayName
        } 🗓 ${moment(row.gameDate).format("DD/MM/YYYY HH:mm")}


🏠 Informações do time de casa (${row.homeName}):

📊 Partidas analisadas: ${row.homeAnalyzedGames}
🥅 Gols HT: ${row.homeGoalsHt}
🥅 Gols FT: ${row.homeGoalsFt}
⛳️ Escanteios HT: ${row.homeCornersHt}
⛳️ Escanteios FT: ${row.homeCornersFt}

🥅 Média de gols HT: ${(row.homeGoalsHt / row.homeAnalyzedGames || 0).toFixed(
          2
        )}
🥅 Média de gols FT: ${(row.homeGoalsFt / row.homeAnalyzedGames || 0).toFixed(
          2
        )}
⛳️ Média de escanteios HT: ${(
          row.homeCornersHt / row.homeAnalyzedGames || 0
        ).toFixed(2)}
⛳️ Média de escanteios FT: ${(
          row.homeCornersFt / row.homeAnalyzedGames || 0
        ).toFixed(2)}



🏃 Informações do time de fora (${row.awayName}):

📊 Partidas analisadas: ${row.awayAnalyzedGames}
🥅 Gols HT: ${row.awayGoalsHt}
🥅 Gols FT: ${row.awayGoalsFt}
⛳️ Escanteios HT: ${row.awayCornersHt}
⛳️ Escanteios FT: ${row.awayCornersFt}

🥅 Média de gols HT: ${(row.awayGoalsHt / row.awayAnalyzedGames || 0).toFixed(
          2
        )}
🥅 Média de gols FT: ${(row.awayGoalsFt / row.awayAnalyzedGames || 0).toFixed(
          2
        )}
⛳️ Média de escanteios HT: ${(
          row.awayCornersHt / row.awayAnalyzedGames || 0
        ).toFixed(2)}
⛳️ Média de escanteios FT: ${(
          row.awayCornersFt / row.awayAnalyzedGames || 0
        ).toFixed(2)}



⚠️ Informações de ambos times:
🥅 Média de gols HT: ${(
          parseFloat(
            (row.homeGoalsHt / row.homeAnalyzedGames || 0).toFixed(2)
          ) +
          parseFloat((row.awayGoalsHt / row.awayAnalyzedGames || 0).toFixed(2))
        ).toFixed(2)}
🥅 Média de gols FT: ${(
          parseFloat(
            (row.homeGoalsFt / row.homeAnalyzedGames || 0).toFixed(2)
          ) +
          parseFloat((row.awayGoalsFt / row.awayAnalyzedGames || 0).toFixed(2))
        ).toFixed(2)}
⛳️ Média de escanteios HT: ${(
          parseFloat(
            (row.homeCornersHt / row.homeAnalyzedGames || 0).toFixed(2)
          ) +
          parseFloat(
            (row.awayCornersHt / row.awayAnalyzedGames || 0).toFixed(2)
          )
        ).toFixed(2)}
⛳️ Média de escanteios FT: ${(
          parseFloat(
            (row.homeCornersFt / row.homeAnalyzedGames || 0).toFixed(2)
          ) +
          parseFloat(
            (row.awayCornersFt / row.awayAnalyzedGames || 0).toFixed(2)
          )
        ).toFixed(2)}`;
        return ctx.reply(message);
      });
    } else {
      return ctx.reply("😑 Você digitou alguma coisa errada, não?");
    }
  } catch (error) {
    console.log(error);
    return ctx.reply("🥴 Oops, ocorreu um erro no meu chip.");
  }
});

//Initialize bot
bot.launch();

//Close DB
db.close((err) => {
  if (err) {
    console.log(err);
  }
});
