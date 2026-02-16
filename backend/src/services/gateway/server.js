require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { sequelize } = require("../../models");
const auth = require("../../middlewares/auth");
const authorize = require("../../middlewares/authorize");
const requestId = require("../../middlewares/requestId");
const requestTiming = require("../../middlewares/requestTiming");
const { getRuntimeStatus } = require("../../utils/runtimeInfo");

const app = express();

app.set("trust proxy", 1);
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  }),
);
app.use(requestId);
app.use(requestTiming);

const AUTH_URL = process.env.AUTH_URL || "http://localhost:5001";
const DATA_URL = process.env.DATA_URL || "http://localhost:5002";
const ANALYTICS_URL = process.env.ANALYTICS_URL || "http://localhost:5003";
const HEALTH_TIMEOUT_MS = Number(process.env.HEALTH_TIMEOUT_MS) || 2000;

function buildProxy(target, routeBase) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 30000,
    pathRewrite: (path) => `${routeBase}${path}`,
    on: {
      proxyReq(proxyReq, req) {
        const requestId = req.requestId || req.headers["x-request-id"];
        if (requestId) {
          proxyReq.setHeader("X-Request-Id", requestId);
        }
      },
    },
    onError(err, req, res) {
      if (res.headersSent) return;
      res.status(502).json({
        error: "Falha ao comunicar com serviço interno",
        target,
      });
    },
  });
}

async function checkHttpStatus(service, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  const started = Date.now();

  try {
    const response = await fetch(`${url}/status`, {
      method: "GET",
      signal: controller.signal,
    });
    const durationMs = Date.now() - started;

    return {
      service,
      ok: response.ok,
      statusCode: response.status,
      durationMs,
    };
  } catch (err) {
    const durationMs = Date.now() - started;

    return {
      service,
      ok: false,
      statusCode: null,
      durationMs,
      error: err.name === "AbortError" ? "timeout" : "unreachable",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function checkDatabase() {
  const started = Date.now();

  try {
    await sequelize.authenticate();
    return {
      service: "database",
      ok: true,
      durationMs: Date.now() - started,
    };
  } catch (err) {
    return {
      service: "database",
      ok: false,
      durationMs: Date.now() - started,
      error: "unreachable",
    };
  }
}

app.get("/", (req, res) => {
  res.send("Gateway API Bank Analytics rodando");
});

app.get("/status", (req, res) => {
  res.json({
    ...getRuntimeStatus("gateway", __dirname),
    routes: {
      auth: AUTH_URL,
      data: DATA_URL,
      analytics: ANALYTICS_URL,
    },
  });
});

app.get("/status/deps", auth, authorize(["admin"]), async (req, res) => {
  const checks = await Promise.all([
    checkDatabase(),
    checkHttpStatus("auth", AUTH_URL),
    checkHttpStatus("data", DATA_URL),
    checkHttpStatus("analytics", ANALYTICS_URL),
  ]);

  const allHealthy = checks.every((check) => check.ok);

  res.status(allHealthy ? 200 : 503).json({
    ...getRuntimeStatus("gateway", __dirname),
    overall: allHealthy ? "healthy" : "degraded",
    timeoutMs: HEALTH_TIMEOUT_MS,
    checks,
  });
});

app.use("/auth", buildProxy(AUTH_URL, "/auth"));

app.use("/agencias", buildProxy(DATA_URL, "/agencias"));
app.use("/users", buildProxy(DATA_URL, "/users"));
app.use("/periodos", buildProxy(DATA_URL, "/periodos"));
app.use("/produtos", buildProxy(DATA_URL, "/produtos"));
app.use("/import", buildProxy(DATA_URL, "/import"));

app.use("/dashboard", buildProxy(ANALYTICS_URL, "/dashboard"));

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`[gateway] ✅ Servidor rodando na porta ${PORT}`);
  console.log(`[gateway] auth -> ${AUTH_URL}`);
  console.log(`[gateway] data -> ${DATA_URL}`);
  console.log(`[gateway] analytics -> ${ANALYTICS_URL}`);
});
