/**
 * Integration Status Resolver
 * Single source of truth for sponsor integration statuses
 */

export type ShardeumStatus = "LIVE" | "DEMO" | "READY";
export type IncoStatus = "LOCAL_PROOF" | "LIVE";

export interface IntegrationStatuses {
  shardeum: ShardeumStatus;
  shardeumAgreement: ShardeumStatus; // Separate status for agreement recording
  inco: IncoStatus;
}

/**
 * Compute Shardeum status based on runtime conditions
 * Supports both MetaMask mode (walletConnected required) and Relayer mode (txHash + contractAddress sufficient)
 */
export function getShardeumStatus(params: {
  walletConnected: boolean;
  chainId?: number;
  contractAddress?: string;
  txHash?: string | null;
  demoMode: boolean;
  walletMode?: string; // "metamask" | "relayer"
}): ShardeumStatus {
  if (params.demoMode) {
    return "DEMO";
  }

  const isRelayerMode = params.walletMode === "relayer" || !params.walletMode;

  // Relayer mode: LIVE if contract address + tx hash exists (no wallet required)
  if (isRelayerMode) {
    const isLive = !!params.contractAddress && !!params.txHash;
    return isLive ? "LIVE" : "READY";
  }

  // MetaMask mode: LIVE only if: wallet connected + chainId 8082 + contract address + tx hash exists
  const isLive =
    params.walletConnected &&
    params.chainId === 8082 &&
    !!params.contractAddress &&
    !!params.txHash;

  return isLive ? "LIVE" : "DEMO";
}

/**
 * Compute INCO status
 */
export function getIncoStatus(params: {
  incoMode: boolean;
  realEndpointConfigured?: boolean;
}): IncoStatus {
  // LOCAL_PROOF unless real endpoint/chain flag is configured
  if (params.realEndpointConfigured) {
    return "LIVE";
  }
  return "LOCAL_PROOF";
}

/**
 * Get Shardeum agreement status
 * Supports both MetaMask mode and Relayer mode
 */
export function getShardeumAgreementStatus(params: {
  walletConnected: boolean;
  chainId?: number;
  contractAddress?: string;
  agreementTxHash?: string | null;
  agreementVerified?: boolean;
  demoMode: boolean;
  walletMode?: string; // "metamask" | "relayer"
}): ShardeumStatus {
  if (params.demoMode) {
    return "DEMO";
  }

  const isRelayerMode = params.walletMode === "relayer" || !params.walletMode;

  // Relayer mode: LIVE if contract address + tx hash exists + verified (no wallet required)
  if (isRelayerMode) {
    const isLive = !!params.contractAddress && !!params.agreementTxHash && params.agreementVerified === true;
    const isReady = !!params.contractAddress && !!params.agreementTxHash;
    if (isLive) return "LIVE";
    if (isReady) return "READY";
    return "DEMO";
  }

  // MetaMask mode: LIVE only if: wallet connected + chainId 8082 + contract address + tx hash exists + verified
  const isLive =
    params.walletConnected &&
    params.chainId === 8082 &&
    !!params.contractAddress &&
    !!params.agreementTxHash &&
    params.agreementVerified === true;

  // READY if conditions met but not verified yet
  const isReady =
    params.walletConnected &&
    params.chainId === 8082 &&
    !!params.contractAddress &&
    !!params.agreementTxHash;

  if (isLive) return "LIVE";
  if (isReady) return "READY";
  return "DEMO";
}

/**
 * Get all integration statuses
 */
export function getAllIntegrationStatuses(params: {
  // Shardeum
  walletConnected: boolean;
  chainId?: number;
  contractAddress?: string;
  txHash?: string | null;
  demoMode: boolean;
  walletMode?: string; // "metamask" | "relayer"
  // Shardeum Agreement
  agreementTxHash?: string | null;
  agreementVerified?: boolean;
  // INCO
  incoMode: boolean;
  incoEndpointConfigured?: boolean;
}): IntegrationStatuses {
  return {
    shardeum: getShardeumStatus({
      walletConnected: params.walletConnected,
      chainId: params.chainId,
      contractAddress: params.contractAddress,
      txHash: params.txHash,
      demoMode: params.demoMode,
      walletMode: params.walletMode,
    }),
    shardeumAgreement: getShardeumAgreementStatus({
      walletConnected: params.walletConnected,
      chainId: params.chainId,
      contractAddress: params.contractAddress,
      agreementTxHash: params.agreementTxHash,
      agreementVerified: params.agreementVerified,
      demoMode: params.demoMode,
      walletMode: params.walletMode,
    }),
    inco: getIncoStatus({
      incoMode: params.incoMode,
      realEndpointConfigured: params.incoEndpointConfigured,
    }),
  };
}
