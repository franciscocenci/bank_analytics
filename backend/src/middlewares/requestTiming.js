const MS_IN_NANO = 1e6;

function getThreshold(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

module.exports = function requestTiming(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on("finish", () => {
    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / MS_IN_NANO;
    const logAll = process.env.LOG_HTTP === "true";
    const slowMs = getThreshold(process.env.LOG_SLOW_HTTP_MS, 500);
    const shouldLog = logAll || (slowMs > 0 && elapsedMs >= slowMs);

    if (!shouldLog) return;

    const status = res.statusCode;
    const method = req.method;
    const path = req.originalUrl || req.url;
    console.log(
      `[HTTP ${elapsedMs.toFixed(1)}ms] ${status} ${method} ${path}`,
    );
  });

  next();
};
