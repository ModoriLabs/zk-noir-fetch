const LOGS_BACKEND_URL = "https://logs.reclaimprotocol.org";
const APP_BACKEND_URL = "https://api.reclaimprotocol.org";
const ATTESTOR_NODE_URL = process.env.ATTESTOR_URL || "ws://localhost:8001/ws";

export { LOGS_BACKEND_URL, APP_BACKEND_URL, ATTESTOR_NODE_URL };
