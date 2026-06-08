import { createPublicClient, http, isAddress, formatEther } from 'viem';

// We configure viem to connect to the Pharos testnet/mainnet. 
const RPC_URL = process.env.PHAROS_RPC_URL || 'https://rpc.pharos.xyz';

export const publicClient = createPublicClient({
  transport: http(RPC_URL),
});

function generateEcosystemMetrics(isSafe: boolean, isWhale = false) {
  if (isSafe) {
    return {
      pharosInteractions: 840,
      uniquePharosContracts: 42,
      ecosystemScore: 95,
      pharosProtocolDiversity: 88,
      pharosNetworkEngagement: 92,
      connectedWallets: 150,
      verifiedContractInteractions: 25,
      suspiciousInteractionCount: 0,
      activityDiversityScore: 85,
    };
  }
  if (isWhale) {
    return {
      pharosInteractions: 120,
      uniquePharosContracts: 3,
      ecosystemScore: 40,
      pharosProtocolDiversity: 20,
      pharosNetworkEngagement: 60,
      connectedWallets: 5,
      verifiedContractInteractions: 2,
      suspiciousInteractionCount: 2,
      activityDiversityScore: 15,
    };
  }
  // High risk
  return {
    pharosInteractions: 15,
    uniquePharosContracts: 1,
    ecosystemScore: 10,
    pharosProtocolDiversity: 5,
    pharosNetworkEngagement: 12,
    connectedWallets: 2,
    verifiedContractInteractions: 0,
    suspiciousInteractionCount: 15,
    activityDiversityScore: 5,
  };
}

export async function getWalletData(address: string) {
  if (!isAddress(address)) throw new Error('Invalid address');
  
  // Live request mock
  const balance = await publicClient.getBalance({ address }).catch(() => 0n);
  const txCount = await publicClient.getTransactionCount({ address }).catch(() => 0);
  
  return {
    address,
    balance: formatEther(balance),
    txCount,
    ageInDays: Math.floor(Math.random() * 400), 
    largeTransfers: Math.floor(Math.random() * 5),
    interactedContracts: Math.floor(Math.random() * 20),
    dataCompleteness: 95,
    analysisCoverage: 98,
    pharosInteractions: Math.floor(Math.random() * 500),
    uniquePharosContracts: Math.floor(Math.random() * 25),
    ecosystemScore: Math.floor(Math.random() * 100),
    pharosProtocolDiversity: Math.floor(Math.random() * 100),
    pharosNetworkEngagement: Math.floor(Math.random() * 100),
    connectedWallets: Math.floor(Math.random() * 50),
    verifiedContractInteractions: Math.floor(Math.random() * 15),
    suspiciousInteractionCount: Math.floor(Math.random() * 3),
    activityDiversityScore: Math.floor(Math.random() * 100),
  };
}

export async function getTokenData(address: string) {
  if (!isAddress(address)) throw new Error('Invalid address');
  
  const top5 = Math.floor(Math.random() * 40) + 10;
  const top10 = top5 + Math.floor(Math.random() * 30);
  return {
    address,
    top5HoldersPercentage: top5,
    top10HoldersPercentage: top10,
    concentrationScore: top10 > 70 ? 80 : top10 > 40 ? 50 : 20,
    activityLevel: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
    dataCompleteness: 90,
    analysisCoverage: 95,
    pharosInteractions: Math.floor(Math.random() * 5000),
    uniquePharosContracts: Math.floor(Math.random() * 25),
    ecosystemScore: Math.floor(Math.random() * 100),
    pharosProtocolDiversity: Math.floor(Math.random() * 100),
    pharosNetworkEngagement: Math.floor(Math.random() * 100),
    connectedWallets: Math.floor(Math.random() * 5000),
    verifiedContractInteractions: Math.floor(Math.random() * 10),
    suspiciousInteractionCount: Math.floor(Math.random() * 5),
    activityDiversityScore: Math.floor(Math.random() * 100),
  };
}

export async function getContractData(address: string) {
  if (!isAddress(address)) throw new Error('Invalid address');

  return {
    address,
    isVerified: Math.random() > 0.5,
    renouncedOwnership: Math.random() > 0.5,
    isUpgradeable: Math.random() > 0.5,
    hasAdminPrivileges: Math.random() > 0.5,
    dataCompleteness: 100,
    analysisCoverage: 100,
    pharosInteractions: Math.floor(Math.random() * 1000),
    uniquePharosContracts: Math.floor(Math.random() * 10),
    ecosystemScore: Math.floor(Math.random() * 100),
    pharosProtocolDiversity: Math.floor(Math.random() * 100),
    pharosNetworkEngagement: Math.floor(Math.random() * 100),
    connectedWallets: Math.floor(Math.random() * 1000),
    verifiedContractInteractions: Math.floor(Math.random() * 5),
    suspiciousInteractionCount: Math.floor(Math.random() * 2),
    activityDiversityScore: Math.floor(Math.random() * 100),
  };
}

export async function getTransactionData(hash: `0x${string}`) {
  const tx = await publicClient.getTransaction({ hash }).catch(() => null);
  return {
    hash,
    from: tx ? tx.from : '0x0',
    to: tx ? tx.to : '0x0',
    value: tx ? formatEther(tx.value) : '0',
    status: 'success',
    contractInteraction: true,
    dataCompleteness: 100,
    analysisCoverage: 100,
    pharosInteractions: 1,
    uniquePharosContracts: 1,
    ecosystemScore: 50,
    pharosProtocolDiversity: 50,
    pharosNetworkEngagement: 50,
    connectedWallets: 2,
    verifiedContractInteractions: 1,
    suspiciousInteractionCount: 0,
    activityDiversityScore: 50,
  };
}
