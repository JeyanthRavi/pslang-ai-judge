/**
 * Simulated Signer for Off-Chain Signatures
 * Uses WebCrypto API for ed25519-style signatures (or deterministic hashing as fallback)
 */

const PARTY_STORAGE_KEY = "verba_simulated_parties";

export interface SimulatedParty {
  id: string;
  displayName: "Party A" | "Party B";
  address: `0x${string}`;
  publicKey?: string; // For future ed25519 support
}

/**
 * Generate or retrieve simulated parties (A and B)
 * Stores in localStorage for persistence
 */
export function getSimulatedParties(): { partyA: SimulatedParty; partyB: SimulatedParty } {
  if (typeof window === "undefined") {
    // Server-side: return defaults
    return {
      partyA: {
        id: "party-a",
        displayName: "Party A",
        address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
      },
      partyB: {
        id: "party-b",
        displayName: "Party B",
        address: "0x0000000000000000000000000000000000000001" as `0x${string}`,
      },
    };
  }

  const stored = localStorage.getItem(PARTY_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // Invalid stored data, generate new
    }
  }

  // Generate deterministic addresses from seeds (synchronous for localStorage)
  const generateAddressSync = (seed: string): `0x${string}` => {
    // Simple deterministic hash (for demo purposes)
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    // Convert to hex and pad to 40 chars (20 bytes = 40 hex chars)
    const hex = Math.abs(hash).toString(16).padStart(8, "0");
    // Repeat pattern to get 40 chars
    const addressHex = `0x${(hex.repeat(5)).slice(0, 40)}` as `0x${string}`;
    return addressHex;
  };

  const partyAAddress = generateAddressSync("verba_party_a_seed_v1");
  const partyBAddress = generateAddressSync("verba_party_b_seed_v1");

  const parties = {
    partyA: {
      id: "party-a",
      displayName: "Party A" as const,
      address: partyAAddress,
    },
    partyB: {
      id: "party-b",
      displayName: "Party B" as const,
      address: partyBAddress,
    },
  };

  localStorage.setItem(PARTY_STORAGE_KEY, JSON.stringify(parties));
  return parties;
}

/**
 * Sign a message with a simulated party
 * Returns a deterministic signature hash (not a real cryptographic signature, but sufficient for demo)
 */
export async function signMessage(
  message: string,
  party: SimulatedParty
): Promise<`0x${string}`> {
  // Create deterministic signature from message + party address
  const encoder = new TextEncoder();
  const data = encoder.encode(`${message}:${party.address}:verba_salt`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  return `0x${hashHex}` as `0x${string}`;
}

/**
 * Verify a signature (for demo purposes, just checks if it matches expected format)
 */
export async function verifySignature(
  message: string,
  signature: `0x${string}`,
  party: SimulatedParty
): Promise<boolean> {
  const expected = await signMessage(message, party);
  return expected === signature;
}

