const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require('cors')

app = express();
app.use(cors())

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.htm"));
});

app.get("/videos", function (req, res) {
  const files = fs.readdirSync("media/");

  res.send({ videos: files });
});

app.get("/stream/:id", function (req, res) {
  const path = "media/" + req.params.id;
  if (!fs.existsSync(path)) {
    res.status(404).send(req.params.id + " do not exists");
    return;
  }
  const stat = fs.statSync(path);
  console.log({ stat });
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize) {
      res
        .status(416)
        .send("Requested range not satisfiable\n" + start + " >= " + fileSize);
      return;
    }

    const chunksize = end - start + 1;
    const file = fs.createReadStream(path, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(path).pipe(res);
  }
});

app.listen(3001, () => {
  console.log("Listening on port 3001!");
});
