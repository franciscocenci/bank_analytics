const { exec } = require("node:child_process");

function checkPostgresConnection() {
  exec("docker exec bank_postgres pg_isready --host localhost", handleReturn);

  function handleReturn(error, stdout) {
    if (stdout.search("accepting connections") === -1) {
      process.stdout.write(".");
      checkPostgresConnection();
      return;
    }
    console.log("\n🟢 Postgres está aceitando conexões!\n");
  }
}

process.stdout.write("\n\n🔴 Aguardando Postgres aceitar conexões");
checkPostgresConnection();
