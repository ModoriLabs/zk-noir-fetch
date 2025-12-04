import { createClaimOnAttestor } from "@reclaimprotocol/attestor-core";
import { HttpMethod, LogType } from "./types";
import { Options, secretOptions } from "./interfaces";
import {
  assertCorrectnessOfOptions,
  validateURL,
  sendLogs,
  validateApplicationIdAndSecret,
  transformProof,
} from "./utils";
import { v4 } from "uuid";
import P from "pino";
import { ATTESTOR_NODE_URL } from "./constants";
const logger = P();

export class ReclaimClient {
  applicationId: string;
  applicationSecret: string;
  logs?: boolean;
  sessionId: string;
  constructor(
    applicationId: string,
    applicationSecret: string,
    logs?: boolean
  ) {
    // validateApplicationIdAndSecret(applicationId, applicationSecret);
    this.applicationId = applicationId;
    this.applicationSecret = applicationSecret;
    this.sessionId = v4().toString();
    // if the logs are enabled, set the logger level to info
    logger.level = logs ? "info" : "silent";
    logger.info(
      `Initializing client with applicationId: ${this.applicationId} and sessionId: ${this.sessionId}`
    );
  }

  async zkFetch(
    url: string,
    options?: Options,
    secretOptions?: secretOptions,
    zkEngine: "snarkjs" | "gnark" | "expander" | "barretenberg" = "snarkjs",
    retries = 1,
    retryInterval = 1000
  ) {
    logger.info(`[zkFetch] Starting zkFetch for URL: ${url}`);
    validateURL(url, "zkFetch");
    logger.info(`[zkFetch] URL validation passed`);

    if (options !== undefined) {
      assertCorrectnessOfOptions(options);
      logger.info(`[zkFetch] Options validation passed`);
    }

    logger.info(`[zkFetch] Sending verification started logs`);
    // await sendLogs({
    //   sessionId: this.sessionId,
    //   logType: LogType.VERIFICATION_STARTED,
    //   applicationId: this.applicationId,
    // });

    let attempt = 0;
    while (attempt < retries) {
      try {
        const claim = await createClaimOnAttestor({
          name: "http" as const,
          params: {
            method: (options?.method as HttpMethod) || HttpMethod.GET,
            url: url,
            responseMatches: secretOptions?.responseMatches || [
              {
                type: "regex",
                value: "(?<data>.*)",
              },
            ],
            headers: options?.headers,
            geoLocation: options?.geoLocation,
            responseRedactions: secretOptions?.responseRedactions || [],
            body: options?.body || "",
            paramValues: options?.paramValues,
            writeRedactionMode: "zk",
            additionalClientOptions: options?.additionalClientOptions,
          },
          context: options?.context,
          secretParams: {
            cookieStr: secretOptions?.cookieStr || "",
            headers: secretOptions?.headers || {},
            paramValues: secretOptions?.paramValues,
          },
          ownerPrivateKey:
            "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
          logger: logger,
          client: {
            url: process.env.ATTESTOR_URL || ATTESTOR_NODE_URL,
          },
          zkEngine: zkEngine,
        });

        logger.info(`[zkFetch] createClaimOnAttestor completed successfully`);

        if (claim.error) {
          logger.error(`[zkFetch] Claim creation failed:`, claim.error);
          throw new Error(
            `Failed to create claim on attestor: ${claim.error.message}`
          );
        }

        logger.info(
          `[zkFetch] Claim created successfully, sending proof generated logs`
        );
        // await sendLogs({
        //   sessionId: this.sessionId,
        //   logType: LogType.PROOF_GENERATED,
        //   applicationId: this.applicationId,
        // });

        logger.info(`[zkFetch] Transforming proof`);
        const result = transformProof(claim);
        logger.info(`[zkFetch] zkFetch completed successfully`);
        return result;
      } catch (error) {
        attempt++;
        logger.error(`[zkFetch] Error on attempt ${attempt}:`, error);
        if (attempt >= retries) {
          logger.error(`[zkFetch] All retries exhausted. Failing.`);
          logger.error(error);
          throw error;
        }
        logger.info(
          `[zkFetch] Retrying in ${retryInterval}ms... (attempt ${
            attempt + 1
          }/${retries})`
        );
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }
}
