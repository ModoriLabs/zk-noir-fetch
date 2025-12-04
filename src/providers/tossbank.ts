import { ReclaimClient } from "../zkfetch";

export interface TossBankParams {
  date: string; // YYYY-MM-DD
  documentId: string; // 0000-XXXX-XXXXXX
  zkEngine: "snarkjs" | "barretenberg";
}

export async function getTossBankDocument(params: TossBankParams) {
  const reclaim = new ReclaimClient("test", "test", false);

  const url = `https://api.tossbank.com/api-public/document/view/{{URL_PARAMS_1}}/{{URL_PARAMS_GRD}}`;

  const requestOptions = {
    method: "GET" as const,
    headers: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
    context: {
      contextAddress: "0x0000000000000000000000000000000000000000",
      contextMessage: "toss_bank_document",
    },
    paramValues: {
      URL_PARAMS_1: params.date,
      URL_PARAMS_GRD: params.documentId,
    },
    additionalClientOptions: {
      supportedProtocolVersions: ["TLS1_2"] as ("TLS1_2" | "TLS1_3")[],
    },
  };

  const privateOptions = {
    responseMatches: [
      {
        type: "regex" as const,
        value: "(?<title>송금확인증)",
      },
    ],
    responseRedactions: [],
  };

  return await reclaim.zkFetch(
    url,
    requestOptions,
    privateOptions,
    params.zkEngine || "snarkjs"
  );
}
