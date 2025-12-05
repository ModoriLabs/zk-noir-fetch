import { NextRequest, NextResponse } from "next/server";
import { getTossBankDocument } from "@modori-labs/zk-noir-fetch";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, documentId, zkEngine } = body;

    // Input validation
    if (!date || !documentId || !zkEngine) {
      return NextResponse.json(
        { error: "Please fill in all fields." },
        { status: 400 }
      );
    }

    // zkEngine validation
    if (!["snarkjs", "barretenberg"].includes(zkEngine)) {
      return NextResponse.json(
        { error: "zkEngine must be either snarkjs or barretenberg." },
        { status: 400 }
      );
    }

    // TossBank document verification
    const proof = await getTossBankDocument({
      date,
      documentId,
      zkEngine: zkEngine as "snarkjs" | "barretenberg",
    });

    console.log("Verification completed successfully");

    return NextResponse.json({
      success: true,
      proof,
      message: "Document verification completed.",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Verification error:", error);

    return NextResponse.json(
      {
        error: error.message || "An error occurred during verification",
        success: false,
      },
      { status: 500 }
    );
  }
}
