import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { shardeumSphinx } from "@/lib/chains";

const AGREEMENT_ABI = parseAbi([
  "function getAgreement(bytes32 _agreementId) external view returns (bytes32 agreementId, bytes32 caseHash, bytes32 evidenceRoot, bytes32 termsHash, address partyA, address partyB, bytes memory sigA, bytes memory sigB, uint64 timestamp)",
]);

/**
 * GET /api/chain/read-agreement?agreementId=0x...
 * Read agreement from Shardeum contract
 */
export async function GET(request: NextRequest) {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS;
    const rpcUrl = process.env.SHARDEUM_RPC_URL || "https://sphinx.shardeum.org/";

    if (!contractAddress) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const agreementId = searchParams.get("agreementId");

    if (!agreementId) {
      return NextResponse.json(
        { error: "Missing agreementId parameter" },
        { status: 400 }
      );
    }

    const client = createPublicClient({
      chain: shardeumSphinx,
      transport: http(rpcUrl),
    });

    const agreement = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: AGREEMENT_ABI,
      functionName: "getAgreement",
      args: [agreementId as `0x${string}`],
    });

    return NextResponse.json({ agreement });
  } catch (error) {
    console.error("Read agreement error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read agreement" },
      { status: 500 }
    );
  }
}

