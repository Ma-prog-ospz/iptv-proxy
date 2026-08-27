import express from "express";
import fetch from "node-fetch";

const app = express();

const MPD_URL = "https://bpcdnmanprod.nexttv.ht.hr/bpk-tv/HRT1/default/index.mpd";

app.get("/hrt1.m3u8", async (req, res) => {
  const mpd = await fetch(MPD_URL).then(r => r.text());

  const segments = [...mpd.matchAll(/media="([^"]+)"/g)].map(m => m[1]);

  let playlist = "#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:4\n#EXT-X-MEDIA-SEQUENCE:0\n";

  segments.forEach(seg => {
    playlist += `#EXTINF:4.0,\n/proxy/${seg}\n`;
  });

  res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
  res.send(playlist);
});

app.get("/proxy/*", async (req, res) => {
  const url = "https://bpcdnmanprod.nexttv.ht.hr/bpk-tv/HRT1/default/" + req.params[0];

  const response = await fetch(url, {
    headers: {
      "Range": req.headers["range"],
      "User-Agent": req.headers["user-agent"]
    }
  });

  res.status(response.status);
  response.body.pipe(res);
});

app.listen(3000);
