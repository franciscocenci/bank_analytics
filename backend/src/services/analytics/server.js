require("dotenv").config();

const app = require("./app");
const { startService } = require("../common/bootstrapService");

startService({
  app,
  serviceName: "analytics",
  portEnvVar: "ANALYTICS_PORT",
  defaultPort: 5003,
});
