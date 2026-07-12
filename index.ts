import "dotenv/config";
import express from "express";
import httpProxy from "http-proxy";
import createHttpError from "http-errors";
import cookieParser from "cookie-parser";
import pug from "pug";

const app = express();
app.use(cookieParser());

const proxy = httpProxy.createProxyServer();

const {
  PORT = 3000,
  TARGET_BASE_URL = "https://google.com",
  ANNOUNCEMENT = "No anouncement message provided",
  COOKIE_NAME = "anouncement_aknowledged",
} = process.env;

app.post("/acknowledge", (req, res) => {
  const {
    headers: { referer = "/" },
  } = req;
  res.cookie(COOKIE_NAME, "true");
  res.redirect(referer);
});

app.get("/{*splat}", (req, res) => {
  const {
    cookies: { [COOKIE_NAME]: acknowledged },
    headers: { "user-agent": userAgent = "" },
  } = req;

  const isBrowser = /Mozilla|Chrome|Safari|Firefox|Edge/.test(userAgent);

  if (!acknowledged && isBrowser) {
    const compiledFunction = pug.compileFile("index.pug");
    const html = compiledFunction({
      message: ANNOUNCEMENT,
    });
    return res.send(html);
  }

  const options = {
    target: TARGET_BASE_URL,
    changeOrigin: true,
  };

  proxy.web(req, res, options, (error: any) => {
    if (error) throw createHttpError(500, error);
  });
});

app.listen(PORT, () => {
  console.log(`Express listening on port ${PORT}`);
});
