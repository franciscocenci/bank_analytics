require("dotenv").config();

const app = require("./app");
const { startService } = require("../common/bootstrapService");

startService({
  app,
  serviceName: "auth",
  portEnvVar: "AUTH_PORT",
  defaultPort: 5001,
});
