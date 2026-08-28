import express from "express";

const app = express();

const PORTAL = "http://klaratv.com:80";
const MAC = "00:1A:79:4F:D1:78";

async function getToken() {
  const url = `${PORTAL}/portal.php?action=handshake&type=stb&token=&JsHttpRequest=1-xml`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `MAC ${MAC}`,
      "User-Agent": "Mozilla/5.0",
      "Referer": `${PORTAL}/c/`,
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest"
    }
  });

  const data = await res.json();
  return data.js.token;
}

async function getChannels(token) {
  const url = `${PORTAL}/portal.php?type=itv&action=get_all_channels&JsHttpRequest=1-xml`;

  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "User-Agent": "Mozilla/5.0",
      "Referer": `${PORTAL}/c/`,
      "Accept": "application/json, text/javascript, */*; q=0.01",
      "X-Requested-With": "XMLHttpRequest"
    }
  });

  const data = await res.json();
  return data.js.data;
}

app.get("/player_api.php", async (req, res) => {
  try {
    const token = await getToken();
    const channels = await getChannels(token);

    res.json({
      user_info: {
        username: "ftv",
        password: "ftv",
        auth: 1,
        status: "Active"
      },
      available_channels: channels
    });

  } catch (err) {
    res.status(500).send("Error: " + err.toString());
  }
});

app.listen(3000, () => console.log("Xtream API running"));
