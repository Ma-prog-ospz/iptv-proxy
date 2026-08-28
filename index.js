import express from "express";

const app = express();

const BASE = "http://klaratv.com:80";
const MAC = "00:1A:79:4F:D1:78";

const COMMON_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
  "Referer": `${BASE}/c/`,
  "Accept": "application/json, text/javascript, */*; q=0.01",
  "X-Requested-With": "XMLHttpRequest"
};

async function getToken() {
  const url = `${BASE}/portal.php?action=handshake&type=stb&token=&JsHttpRequest=1-xml`;

  const res = await fetch(url, {
    headers: {
      ...COMMON_HEADERS,
      "Authorization": `MAC ${MAC}`
    }
  });

  const text = await res.text();

  // Ako nije JSON → error
  if (!text.startsWith("{")) {
    throw new Error("Handshake returned non‑JSON: " + text.slice(0, 200));
  }

  const data = JSON.parse(text);
  return data.js.token;
}

async function getChannels(token) {
  const url = `${BASE}/portal.php?type=itv&action=get_all_channels&JsHttpRequest=1-xml`;

  const res = await fetch(url, {
    headers: {
      ...COMMON_HEADERS,
      "Authorization": `Bearer ${token}`
    }
  });

  const text = await res.text();

  if (!text.startsWith("{")) {
    throw new Error("Channels returned non‑JSON: " + text.slice(0, 200));
  }

  const data = JSON.parse(text);
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
