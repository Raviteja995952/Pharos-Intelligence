import { createPublicClient, http, isAddress, formatEther } from 'viem';

// We configure viem to connect to the Pharos Mainnet
const RPC_URL = process.env.PHAROS_RPC_URL || 'https://rpc.pharos.xyz';
const EXPLORER_API_URL = 'https://pharosscan.xyz/api';

export const publicClient = createPublicClient({
  transport: http(RPC_URL),
});

const DATA_SOURCES = [
  "Pharos Mainnet RPC",
  "Pharos Mainnet Explorer",
  "Onchain Transactions"
];

async function fetchExplorerTransactions(address: string) {
  try {
    const res = await fetch(`${EXPLORER_API_URL}?module=account&action=txlist&address=${address}&page=1&offset=1000&sort=desc`);
    const data = await res.json();
    if (data.status === '1' && Array.isArray(data.result)) {
      return data.result;
    }
  } catch (e) {
    console.error("Failed to fetch explorer transactions", e);
  }
  return null;
}

export async function getWalletData(address: string) {
  if (!isAddress(address)) throw new Error('Invalid address');
  
  const balance = await publicClient.getBalance({ address }).catch(() => null);
  const txCount = await publicClient.getTransactionCount({ address }).catch(() => null);
  
  const transactions = await fetchExplorerTransactions(address);
  
  let ageInDays = null;
  let interactedContracts = null;
  let largeTransfers = null;
  let pharosInteractions = null;
  let uniquePharosContracts = null;
  let connectedWallets = null;

  if (transactions && transactions.length > 0) {
    const firstTx = transactions[transactions.length - 1];
    if (firstTx.timeStamp) {
      ageInDays = Math.floor((Date.now() / 1000 - parseInt(firstTx.timeStamp)) / (60 * 60 * 24));
    }

    const uniqueTo = new Set<string>();
    let lTransfers = 0;
    
    transactions.forEach((tx: any) => {
      if (tx.to && tx.to.toLowerCase() !== address.toLowerCase()) {
        uniqueTo.add(tx.to.toLowerCase());
      }
      if (tx.value && BigInt(tx.value) > 1000000000000000000000n) { // > 1000 tokens
        lTransfers++;
      }
    });

    interactedContracts = uniqueTo.size; // Estimate for contracts/EOAs interacted
    uniquePharosContracts = uniqueTo.size;
    largeTransfers = lTransfers;
    pharosInteractions = transactions.length;
    connectedWallets = uniqueTo.size; // Unique destinations
  }

  return {
    address,
    balance: balance !== null ? formatEther(balance) : null,
    txCount,
    ageInDays,
    largeTransfers,
    interactedContracts,
    pharosInteractions,
    uniquePharosContracts,
    connectedWallets,
    dataSources: DATA_SOURCES
  };
}

export async function getTokenData(address: string) {
  if (!isAddress(address)) throw new Error('Invalid address');
  
  return {
    address,
    top5HoldersPercentage: null,
    top10HoldersPercentage: null,
    concentrationScore: null,
    activityLevel: null,
    pharosInteractions: null,
    uniquePharosContracts: null,
    connectedWallets: null,
    dataSources: DATA_SOURCES
  };
}

export async function getContractData(address: string) {
  if (!isAddress(address)) throw new Error('Invalid address');

  // We can verify if code exists
  const bytecode = await publicClient.getBytecode({ address }).catch(() => null);
  const isContract = bytecode && bytecode !== '0x';

  return {
    address,
    isVerified: null,
    renouncedOwnership: null,
    isUpgradeable: null,
    hasAdminPrivileges: null,
    isContract,
    pharosInteractions: null,
    uniquePharosContracts: null,
    connectedWallets: null,
    dataSources: DATA_SOURCES
  };
}

export async function getTransactionData(hash: `0x${string}`) {
  const tx = await publicClient.getTransaction({ hash }).catch(() => null);
  return {
    hash,
    from: tx ? tx.from : null,
    to: tx ? tx.to : null,
    value: tx ? formatEther(tx.value) : null,
    status: tx ? 'success' : null,
    contractInteraction: tx && tx.input !== '0x',
    dataSources: DATA_SOURCES
  };
}
