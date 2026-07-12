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
  TARGET_BASE_URL,
  ANNOUNCEMENT = "No anouncement message provided",
  COOKIE_NAME = "anouncement_aknowledged",
} = process.env;

if (!TARGET_BASE_URL) {
  throw new Error("TARGET_BASE_URL environment variable must be set");
}

app.post("/acknowledge", (req, res) => {
  const {
    headers: { referer, host },
  } = req;

  let redirectPath = "/";
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.host === host) {
        redirectPath = `${refererUrl.pathname}${refererUrl.search}`;
      }
    } catch {
      // invalid referer header, fall back to "/"
    }
  }

  res.cookie(COOKIE_NAME, "true", {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });
  res.redirect(redirectPath);
});

app.get("/{*splat}", (req, res, next) => {
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
    next(createHttpError(502, error));
  });
});

app.listen(PORT, () => {
  console.log(`Express listening on port ${PORT}`);
});
