require("dotenv").config();

const app = require("./app");
const { startService } = require("../common/bootstrapService");

startService({
  app,
  serviceName: "data",
  portEnvVar: "DATA_PORT",
  defaultPort: 5002,
});
