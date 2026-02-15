const { Sequelize } = require("sequelize");
require("dotenv").config();

const logSqlEnabled = process.env.LOG_SQL === "true";
const slowQueryMs = Number(process.env.LOG_SLOW_QUERY_MS) || 0;
const enableBenchmark = logSqlEnabled || slowQueryMs > 0;

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    benchmark: enableBenchmark,
    logging: enableBenchmark
      ? (sql, timingMs) => {
          if (logSqlEnabled || (slowQueryMs > 0 && timingMs >= slowQueryMs)) {
            console.log(`[SQL ${timingMs}ms] ${sql}`);
          }
        }
      : false,
  },
);

module.exports = sequelize;
