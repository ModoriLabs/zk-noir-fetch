const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const execPromise = promisify(exec);

// Configuration
const GIT_COMMIT_HASH = "0405a22e59c78c1ca479083d30d55bb543d6e7fe";
const CLONE_DIR = "./zk-symmetric-crypto-temp";
const REPO_URL = "https://github.com/ModoriLabs/zk-symmetric-crypto";

// Directories to copy from the cloned repo
const DIRS_TO_COPY = ["resources", "bin"];

// Target directories - handles different node_modules layouts
const TARGET_DIRS = [
  path.resolve(
    process.cwd(),
    "node_modules",
    "@reclaimprotocol",
    "attestor-core",
    "node_modules",
    "@reclaimprotocol",
    "zk-symmetric-crypto"
  ),
  path.resolve(
    process.cwd(),
    "node_modules",
    "@reclaimprotocol",
    "zk-symmetric-crypto"
  ),
  path.resolve(process.cwd(), "node_modules", "zk-symmetric-crypto-test"),
];

// Logger
const logger = console;

// Clone command
const CLONE_CMD = [
  `git clone ${REPO_URL} ${CLONE_DIR}`,
  `cd ${CLONE_DIR}`,
  `git reset ${GIT_COMMIT_HASH} --hard`,
].join(" && ");

// Helper functions
async function ensureDirectory(dirPath) {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

async function cleanDirectory(dirPath) {
  await fs.promises.rm(dirPath, { recursive: true, force: true });
}

async function fileExists(filePath) {
  try {
    await fs.promises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function checkExistingFiles() {
  logger.info("Checking for existing files...");

  // Check if both resources and bin directories exist in at least one target
  for (const targetDir of TARGET_DIRS) {
    let allDirsExist = true;
    for (const dir of DIRS_TO_COPY) {
      const dirPath = path.join(targetDir, dir);
      if (!(await fileExists(dirPath))) {
        allDirsExist = false;
        break;
      }
    }
    if (allDirsExist) {
      logger.info(
        `Found existing directories in ${targetDir}. Skipping download.`
      );
      return true;
    }
  }

  return false;
}

async function main() {
  try {
    // Check if files already exist
    if (await checkExistingFiles()) {
      logger.info(
        "ZK circuit files and binaries already exist. Skipping download."
      );
      process.exit(0);
    }

    // Clean up any existing clone directory
    await cleanDirectory(CLONE_DIR);
    logger.info(`Removed old "${CLONE_DIR}" directory if it existed`);

    // Clone the repository
    logger.info(
      `Cloning repo ${REPO_URL}, commit #${GIT_COMMIT_HASH}. This may take a while...`
    );
    await execPromise(CLONE_CMD);
    logger.info(`Successfully cloned repo to "${CLONE_DIR}"`);

    // Deploy to target directories
    logger.info("Deploying files to target directories...");

    for (const targetDir of TARGET_DIRS) {
      try {
        // Ensure the target directory exists
        await ensureDirectory(targetDir);

        // Copy each directory
        for (const dir of DIRS_TO_COPY) {
          const sourcePath = path.join(CLONE_DIR, dir);
          const targetPath = path.join(targetDir, dir);

          // Remove existing directory if it exists
          await cleanDirectory(targetPath);

          // Copy directory
          await fs.promises.cp(sourcePath, targetPath, { recursive: true });
          logger.info(`Copied "${dir}" to ${targetPath}`);
        }
      } catch (error) {
        logger.error(`Failed to deploy to ${targetDir}: ${error.message}`);
      }
    }

    // Clean up the cloned directory
    await cleanDirectory(CLONE_DIR);
    logger.info(`Removed "${CLONE_DIR}" directory`);

    logger.info("ZK circuit files and binaries ready.");
    process.exit(0);
  } catch (error) {
    logger.error("Fatal error occurred:", error);

    // Try to clean up on error
    try {
      await cleanDirectory(CLONE_DIR);
    } catch (cleanupError) {
      logger.error("Failed to clean up clone directory:", cleanupError);
    }

    process.exit(1);
  }
}

// Run the main function
main();
