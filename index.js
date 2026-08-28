import express from "express";
import fetch from "node-fetch";

const app = express();

const PORTAL = "http://klaratv.com:80/c/";
const MAC = "00:1A:79:4F:D1:78";

async function getToken() {
  const res = await fetch(`${PORTAL}server/load.php?type=stb&action=handshake&mac=${MAC}`);
  const data = await res.json();
  return data.token;
}

async function getChannels(token) {
  const res = await fetch(`${PORTAL}server/load.php?type=itv&action=get_all_channels&mac=${MAC}&token=${token}`);
  const data = await res.json();
  return data.data;
}

app.get("/player_api.php", async (req, res) => {
  const token = await getToken();
  const channels = await getChannels(token);

  const xtream = {
    user_info: {
      username: "ftv",
      password: "ftv",
      auth: 1,
      status: "Active"
    },
    available_channels: channels
  };

  res.json(xtream);
});

app.listen(3000, () => console.log("Xtream API running"));
