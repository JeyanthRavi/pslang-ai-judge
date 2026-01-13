/**
 * Simulated Wallet Provider
 * Provides wallet functionality without requiring MetaMask or external wallet
 * Used when NEXT_PUBLIC_WALLET_MODE=sim
 */

const SIM_WALLET_STORAGE_KEY = "verba_sim_wallet";

export interface SimulatedWallet {
  address: `0x${string}`;
  privateKey: string; // For deterministic address generation (not exposed)
}

/**
 * Get or create a simulated wallet address
 * Uses localStorage to persist the same address across sessions
 */
export async function getSimulatedWallet(): Promise<SimulatedWallet> {
  if (typeof window === "undefined") {
    // Server-side: return a default
    return {
      address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      privateKey: "",
    };
  }

  const stored = localStorage.getItem(SIM_WALLET_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid stored data, generate new
    }
  }

  // Generate deterministic address from a seed (persistent across sessions)
  const seed = "verba_sim_wallet_seed_v1";
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  
  // Use first 40 chars of hash as address (deterministic)
  const address = `0x${hashHex.slice(0, 40)}` as `0x${string}`;
  const wallet: SimulatedWallet = {
    address,
    privateKey: seed, // Not a real private key, just for storage
  };

  localStorage.setItem(SIM_WALLET_STORAGE_KEY, JSON.stringify(wallet));
  return wallet;
}

/**
 * Generate a fake signature for a message
 * Returns a deterministic hash-based signature
 */
export async function signMessageSim(message: string, address: `0x${string}`): Promise<`0x${string}`> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message + address + "verba_salt");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}` as `0x${string}`;
}

/**
 * Generate a fake transaction hash
 * Stores transaction data in localStorage for verification
 */
export async function simulateTransaction(
  contractAddress: string,
  functionName: string,
  args: any[],
  from: `0x${string}`
): Promise<`0x${string}`> {
  const txData = {
    contractAddress,
    functionName,
    args,
    from,
    timestamp: Date.now(),
  };

  // Generate deterministic tx hash
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(txData));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  const txHash = `0x${hashHex}` as `0x${string}`;

  // Store in localStorage for verification
  const stored = localStorage.getItem("verba_sim_txs") || "[]";
  const txs = JSON.parse(stored);
  txs.push({ txHash, ...txData });
  localStorage.setItem("verba_sim_txs", JSON.stringify(txs));

  return txHash;
}

/**
 * Read simulated transaction data
 */
export function getSimulatedTransaction(txHash: `0x${string}`): any | null {
  if (typeof window === "undefined") return null;
  
  const stored = localStorage.getItem("verba_sim_txs");
  if (!stored) return null;

  try {
    const txs = JSON.parse(stored);
    return txs.find((tx: any) => tx.txHash === txHash) || null;
  } catch {
    return null;
  }
}

/**
 * Read simulated contract state
 * For view functions, returns the stored data as if it were a contract return
 */
export function getSimulatedContractState(
  contractAddress: string,
  functionName: string,
  args: any[]
): any | null {
  if (typeof window === "undefined") return null;

  // Find matching transaction (for write functions, the args contain the data)
  const stored = localStorage.getItem("verba_sim_txs");
  if (!stored) return null;

  try {
    const txs = JSON.parse(stored);
    // For getAgreement, find the recordAgreement transaction that matches the agreementId
    if (functionName === "getAgreement" && args.length > 0) {
      const agreementId = args[0];
      const match = txs.find(
        (tx: any) =>
          tx.contractAddress === contractAddress &&
          tx.functionName === "recordAgreement" &&
          tx.args && tx.args[0] === agreementId
      );
      
      if (match && match.args) {
        // Return as tuple: [agreementId, caseHash, evidenceRoot, termsHash, partyA, partyB, sigA, sigB, timestamp]
        return [
          match.args[0], // agreementId
          match.args[1], // caseHash
          match.args[2], // evidenceRoot
          match.args[3], // termsHash
          match.args[4], // partyA
          match.args[5], // partyB
          match.args[6], // sigA
          match.args[7], // sigB
          BigInt(match.timestamp), // timestamp
        ];
      }
    }
    
    // For other functions, return args if match found
    const match = txs.find(
      (tx: any) =>
        tx.contractAddress === contractAddress &&
        tx.functionName === functionName &&
        JSON.stringify(tx.args) === JSON.stringify(args)
    );
    return match ? match.args : null;
  } catch {
    return null;
  }
}

