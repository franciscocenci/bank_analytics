const fs = require("fs");
const path = require("path");

function resolveGitDir(startDir) {
  let currentDir = startDir;

  while (currentDir && currentDir !== path.dirname(currentDir)) {
    const gitPath = path.join(currentDir, ".git");

    if (fs.existsSync(gitPath)) {
      const stat = fs.statSync(gitPath);

      if (stat.isDirectory()) return gitPath;

      const content = fs.readFileSync(gitPath, "utf8");
      const match = content.match(/gitdir:\s*(.+)/i);
      if (!match) return null;
      return path.resolve(currentDir, match[1].trim());
    }

    currentDir = path.dirname(currentDir);
  }

  return null;
}

function readPackedRef(gitDir, ref) {
  const packedRefsPath = path.join(gitDir, "packed-refs");
  if (!fs.existsSync(packedRefsPath)) return null;

  const lines = fs.readFileSync(packedRefsPath, "utf8").split("\n");
  for (const line of lines) {
    if (!line || line.startsWith("#") || line.startsWith("^")) continue;
    const [hash, packedRef] = line.trim().split(" ");
    if (packedRef === ref) return hash;
  }

  return null;
}

function getGitCommit(startDir = process.cwd()) {
  try {
    if (process.env.GIT_COMMIT) return process.env.GIT_COMMIT;

    const gitDir = resolveGitDir(startDir);
    if (!gitDir) return null;

    const headPath = path.join(gitDir, "HEAD");
    if (!fs.existsSync(headPath)) return null;

    const head = fs.readFileSync(headPath, "utf8").trim();
    if (!head.startsWith("ref:")) return head;

    const ref = head.replace("ref:", "").trim();
    const refPath = path.join(gitDir, ref);

    if (fs.existsSync(refPath)) {
      return fs.readFileSync(refPath, "utf8").trim();
    }

    return readPackedRef(gitDir, ref);
  } catch (err) {
    return null;
  }
}

function getRuntimeStatus(serviceName, startDir = process.cwd()) {
  return {
    status: "ok",
    service: serviceName,
    env: process.env.NODE_ENV || "unknown",
    commit: getGitCommit(startDir) || "unknown",
    timestamp: new Date().toISOString(),
  };
}

module.exports = {
  getGitCommit,
  getRuntimeStatus,
};
