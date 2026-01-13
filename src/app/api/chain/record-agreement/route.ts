import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { shardeumSphinx } from "@/lib/chains";

const AGREEMENT_ABI = parseAbi([
  "function recordAgreement(bytes32 _agreementId, bytes32 _caseHash, bytes32 _evidenceRoot, bytes32 _termsHash, address _partyA, address _partyB, bytes calldata _sigA, bytes calldata _sigB) external",
]);

/**
 * POST /api/chain/record-agreement
 * Relayer endpoint to record agreement on Shardeum
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
    const {
      agreementId,
      caseHash,
      evidenceRoot,
      termsHash,
      partyA,
      partyB,
      sigA,
      sigB,
    } = body;

    if (!agreementId || !caseHash || !evidenceRoot || !termsHash || !partyA || !partyB || !sigA || !sigB) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
      abi: AGREEMENT_ABI,
      functionName: "recordAgreement",
      args: [
        agreementId as `0x${string}`,
        caseHash as `0x${string}`,
        evidenceRoot as `0x${string}`,
        termsHash as `0x${string}`,
        partyA as `0x${string}`,
        partyB as `0x${string}`,
        sigA as `0x${string}`,
        sigB as `0x${string}`,
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
    console.error("Relayer recordAgreement error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to record agreement" },
      { status: 500 }
    );
  }
}

