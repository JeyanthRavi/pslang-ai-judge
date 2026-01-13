import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { shardeumSphinx } from "@/lib/chains";

const VERDICT_ABI = parseAbi([
  "function recordReceipt(bytes32 _caseHash, uint8 _outcomeCode, uint16 _confidenceBps, bytes32 _evidenceRoot) external",
]);

/**
 * POST /api/chain/record-receipt
 * Relayer endpoint to record verdict receipt on Shardeum
 */
export async function POST(request: NextRequest) {
  try {
    const relayerKey = process.env.RELAYER_PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS;
    const rpcUrl = process.env.SHARDEUM_RPC_URL || "https://sphinx.shardeum.org/";

    if (!relayerKey) {
      return NextResponse.json(
        { error: "RELAYER_PRIVATE_KEY not configured" },
        { status: 500 }
      );
    }

    if (!contractAddress) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_VERDICT_CONTRACT_ADDRESS not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { caseHash, outcomeCode, confidenceBps, evidenceRoot } = body;

    if (!caseHash || outcomeCode === undefined || confidenceBps === undefined || !evidenceRoot) {
      return NextResponse.json(
        { error: "Missing required fields: caseHash, outcomeCode, confidenceBps, evidenceRoot" },
        { status: 400 }
      );
    }

    // Create wallet client with relayer key
    const account = privateKeyToAccount(`0x${relayerKey.replace("0x", "")}` as `0x${string}`);
    const client = createWalletClient({
      account,
      chain: shardeumSphinx,
      transport: http(rpcUrl),
    });

    // Call contract
    const txHash = await client.writeContract({
      address: contractAddress as `0x${string}`,
      abi: VERDICT_ABI,
      functionName: "recordReceipt",
      args: [
        caseHash as `0x${string}`,
        outcomeCode as number,
        confidenceBps as number,
        evidenceRoot as `0x${string}`,
      ],
    });

    // Return tx hash with relayer address in header
    return NextResponse.json(
      { txHash },
      {
        headers: {
          "x-relayer-address": account.address,
        },
      }
    );
  } catch (error) {
    console.error("Relayer recordReceipt error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record receipt" },
      { status: 500 }
    );
  }
}

