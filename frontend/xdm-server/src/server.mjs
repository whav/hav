import bundleMDX from "./mdx.mjs";
import express from "express";

const app = express();
const port = 3000;

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get("/", (req, res) => {
  res.send("Don't get me!");
});

app.post("/", async (req, resp) => {
  const code = await bundleMDX(req.body.mdx || "");
  resp.type(".js");
  resp.send(code);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
