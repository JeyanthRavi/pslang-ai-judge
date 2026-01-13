import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, http, parseAbi } from "viem";
import { shardeumSphinx } from "@/lib/chains";

const VERDICT_ABI = parseAbi([
  "function getReceipt(bytes32 _caseHash) external view returns (bytes32 caseHash, uint8 outcomeCode, uint16 confidenceBps, bytes32 evidenceRoot, uint256 timestamp, address submitter)",
]);

/**
 * GET /api/chain/read-receipt?caseHash=0x...
 * Read receipt from Shardeum contract
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
    const caseHash = searchParams.get("caseHash");

    if (!caseHash) {
      return NextResponse.json(
        { error: "Missing caseHash parameter" },
        { status: 400 }
      );
    }

    const client = createPublicClient({
      chain: shardeumSphinx,
      transport: http(rpcUrl),
    });

    const receipt = await client.readContract({
      address: contractAddress as `0x${string}`,
      abi: VERDICT_ABI,
      functionName: "getReceipt",
      args: [caseHash as `0x${string}`],
    });

    return NextResponse.json({ receipt });
  } catch (error) {
    console.error("Read receipt error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to read receipt" },
      { status: 500 }
    );
  }
}

