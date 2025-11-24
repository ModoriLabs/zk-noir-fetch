import { getTossBankDocs } from "./getTossBankDocs";
import { expect, test, describe, beforeAll } from "vitest";

describe("TossBank Document Tests", () => {
  let tossBankProof: any = null;

  beforeAll(async () => {
    tossBankProof = await getTossBankDocs();
    console.log("=== TossBank Proof 결과 ===");
    console.log("Identifier:", tossBankProof?.identifier);
    console.log("추출된 값들:", tossBankProof?.extractedParameterValues);
    console.log(
      "Context:",
      JSON.parse(tossBankProof?.claimData?.context || "{}")
    );
  }, 100000);

  test("should return valid context data", () => {
    const context = JSON.parse(tossBankProof?.claimData?.context || "{}");

    expect(context).toBeDefined();
    expect(context.contextAddress).toBeDefined();
    expect(context.contextAddress).toContain(
      "0x0000000000000000000000000000000000000000"
    );
    expect(context.contextMessage).toBeDefined();
    expect(context.contextMessage).toContain("toss_bank_document");
  });

  test("should return TossBank document data", () => {
    expect(tossBankProof).toBeDefined();
    expect(tossBankProof?.extractedParameterValues).toBeDefined();
    expect(tossBankProof?.extractedParameterValues?.title).toBeDefined();
    expect(tossBankProof?.extractedParameterValues?.title).toBe("송금확인증");
  });
});

// describe('ETH Price Tests', () => {
//   test('should return valid context data', async () => {
//     const ethPriceProof = await getEthPrice();
//     const context = JSON.parse(ethPriceProof?.claimData?.context || "{}");

//     expect(context).toBeDefined();
//     expect(context.contextAddress).toBeDefined();
//     expect(context.contextAddress).toContain("0x0000000000000000000000000000000000000000");
//     expect(context.contextMessage).toBeDefined();
//     expect(context.contextMessage).toContain("eth_price");
//   }, 100000);

//   test('should return ETH price', async () => {
//     const ethPriceProof = await getEthPrice();
//     const price = parseFloat(ethPriceProof?.extractedParameterValues?.price);

//     expect(ethPriceProof).toBeDefined();
//     expect(ethPriceProof?.extractedParameterValues).toBeDefined();
//     expect(price).toBeDefined();
//     expect(price).toBeGreaterThan(0);
//   }, 100000);
// });
