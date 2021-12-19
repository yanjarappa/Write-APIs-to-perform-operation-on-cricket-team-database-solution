const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjetToResponseObjet = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const playersQuery = `SELECT *
    FROM cricket_team;`;
  const listOfPlayers = await db.all(playersQuery);
  response.send(
    listOfPlayers.map((eachPlayer) => {
      convertDbObjetToResponseObjet(eachPlayer);
    })
  );
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const playerQuery = `INSERT INTO 
     cricket_team
    (player_name,jersey_number, role)
    VALUES
    (${playerName},${jerseyNumber}, ${role});`;
  await db.run(playerQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const playerId = request.params;
  const playersQuery = `
    SELECT 
    *
    FROM 
    cricket_team
    WHERE
     player_id=${playerId};`;
  const player = await db.get(playersQuery);
  response.send(convertDbObjetToResponseObjet(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const playerId = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const playerQuery = `UPDATE cricket_team
    SET
    player_name=${playerName},
    jersey_number=${jerseyNumber},
    role=${role}
    WHERE
    player_id=${playerId}`;
  await db.run(playerQuery);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const playerId = request.params;
  const playerQuery = `DELETE FROM
    cricket_team
    WHERE
    player_id=${playerId}`;
  await db.run(playerQuery);
  response.send("Player Removed");
});
module.exports = app;
