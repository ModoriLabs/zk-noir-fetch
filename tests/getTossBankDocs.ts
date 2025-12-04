import { config } from "dotenv";
config();
import { getTossBankDocument } from "../src";

export const getTossBankDocs = async () => {
  return await getTossBankDocument({
    date: "YYYY-MM-DD",
    documentId: "0000-XXXX-XXXXXX",
    zkEngine: "snarkjs",
  });
};
