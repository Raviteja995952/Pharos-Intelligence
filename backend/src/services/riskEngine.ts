import { getWalletData, getTokenData, getContractData, getTransactionData } from './blockchainService';
import { generateAIAssessment } from './aiService';

// --- Helper Functions ---

function calculateGrade(score: number | null) {
  if (score === null) return 'N/A';
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  if (score >= 20) return 'D';
  return 'F';
}

function calculateConfidence(data: any) {
  let metricsPresent = 0;
  let metricsTotal = 0;
  const missingMetrics: string[] = [];

  const check = (key: string, name: string) => {
    metricsTotal++;
    if (data[key] !== null && data[key] !== undefined) {
      metricsPresent++;
    } else {
      missingMetrics.push(name);
    }
  };

  check('balance', 'Balance');
  check('txCount', 'Transaction Count');
  check('ageInDays', 'Wallet Age');
  check('interactedContracts', 'Contract Interactions');
  check('largeTransfers', 'Large Transfers');

  const score = metricsTotal > 0 ? Math.round((metricsPresent / metricsTotal) * 100) : 0;
  
  let reason = "Limited dataset";
  if (score >= 90) reason = "Nearly complete dataset";
  else if (score >= 70) reason = "Partial dataset";

  return { score, reason, missingMetrics };
}

function calculatePharosNativeScore(data: any) {
  let score = 50;
  let metricsCount = 0;
  let totalPoints = 0;

  if (data.pharosInteractions !== null) {
    metricsCount++;
    totalPoints += Math.min(100, (data.pharosInteractions / 100) * 100);
  }
  if (data.uniquePharosContracts !== null) {
    metricsCount++;
    totalPoints += Math.min(100, (data.uniquePharosContracts / 10) * 100);
  }
  if (data.ageInDays !== null) {
    metricsCount++;
    totalPoints += Math.min(100, (data.ageInDays / 30) * 100);
  }

  if (metricsCount === 0) return null;
  return Math.round(totalPoints / metricsCount);
}

function getNetworkIntelligence(data: any) {
  return {
    connectedWallets: data.connectedWallets !== null ? data.connectedWallets : 'Insufficient Data',
    verifiedContracts: data.isVerified !== null ? (data.isVerified ? 1 : 0) : 'Insufficient Data',
    highRiskInteractions: data.largeTransfers !== null ? data.largeTransfers : 'Insufficient Data',
    diversityScore: data.interactedContracts !== null ? Math.min(100, data.interactedContracts * 5) : 'Insufficient Data',
    assessment: "Network activity analyzed from available onchain records."
  };
}

function getEcosystemIntelligence(data: any, entityType: string) {
  return {
    pharosInteractions: data.pharosInteractions !== null ? data.pharosInteractions : 'Insufficient Data',
    uniqueContracts: data.uniquePharosContracts !== null ? data.uniquePharosContracts : 'Insufficient Data',
    ecosystemScore: calculatePharosNativeScore(data) || 'Insufficient Data',
    protocolDiversity: data.uniquePharosContracts !== null ? Math.min(100, data.uniquePharosContracts * 10) : 'Insufficient Data',
    networkEngagement: data.txCount !== null ? Math.min(100, data.txCount * 2) : 'Insufficient Data',
    assessment: `Ecosystem participation evaluated from mainnet data.`
  };
}

function generateBadges(data: any, riskLevel: string, entityType: string) {
  const badges: { label: string, color: 'green' | 'yellow' | 'red' }[] = [];
  
  if (data.ageInDays !== null) {
    if (data.ageInDays > 180) badges.push({ label: 'Established ' + entityType, color: 'green' });
    else if (data.ageInDays < 30) badges.push({ label: 'New ' + entityType, color: 'yellow' });
  }
  
  if (data.txCount !== null && data.txCount > 500) badges.push({ label: 'High Activity', color: 'green' });
  if (data.interactedContracts !== null && data.interactedContracts > 10) badges.push({ label: 'Protocol Power User', color: 'green' });
  if (data.largeTransfers !== null && data.largeTransfers > 3) badges.push({ label: 'Suspicious Activity Spike', color: 'red' });
  
  if (entityType === 'Contract' && data.isContract) {
    badges.push({ label: 'Smart Contract', color: 'yellow' });
  }

  return badges.slice(0, 4);
}

function generateAnalystNotes(entityType: string, score: number | null, data: any) {
  if (score === null) return `Insufficient data to generate conclusive analyst notes for this ${entityType.toLowerCase()}.`;
  if (score >= 80) return `This ${entityType.toLowerCase()} demonstrates consistent behavior patterns on the Pharos Mainnet.`;
  if (score >= 60) return `This ${entityType.toLowerCase()} shows acceptable network usage with some missing or neutral signals.`;
  if (score >= 40) return `This ${entityType.toLowerCase()} exhibits concerning behavioral traits based on available data.`;
  return `WARNING: This ${entityType.toLowerCase()} has triggered risk indicators based on onchain data.`;
}

function generateFollowUpQuestions(entityType: string, riskScore: number | null, riskLevel: string) {
  return [
    { question: "Why is data missing?", answer: `Some metrics may be unavailable if the entity has limited history on the Pharos Mainnet or if the Explorer API rate limits requests.` },
    { question: "How was this score calculated?", answer: `Scores are derived strictly from verifiable onchain data including transaction counts, contract interactions, and wallet age.` }
  ];
}

function calculateVerdict(score: number | null) {
  if (score === null) return { verdict: 'CAUTION', reason: 'Insufficient data to provide a definitive verdict. Proceed with caution.' };
  if (score >= 70) return { verdict: 'YES', reason: 'High confidence profile based on available onchain data. Safe to interact.' };
  if (score >= 40) return { verdict: 'CAUTION', reason: 'Mixed signals detected or partial data available. Proceed with careful due diligence.' };
  return { verdict: 'NO', reason: 'High risk profile indicated by onchain metrics. Interaction is discouraged.' };
}

// --- Scoring Logic ---

function calculateWalletRisk(data: any) {
  let scorePoints = 0;
  let scoreWeights = 0;
  const scoreImpacts: { description: string, value: string }[] = [];
  const positiveSignals: string[] = [];
  const riskSignals: string[] = [];
  const smartRecommendations: string[] = [];
  
  let breakdown = { 
    age: data.ageInDays !== null ? Math.min(100, data.ageInDays) : null, 
    activity: data.txCount !== null ? Math.min(100, data.txCount) : null, 
    quality: data.interactedContracts !== null ? Math.min(100, data.interactedContracts * 10) : null, 
    behavior: data.largeTransfers !== null ? Math.max(0, 100 - (data.largeTransfers * 20)) : null, 
    network: 50 
  };

  if (data.ageInDays !== null) {
    scoreWeights += 30;
    if (data.ageInDays > 180) { scorePoints += 30; scoreImpacts.push({ description: 'Wallet age > 180 days', value: '+30' }); positiveSignals.push('Established wallet'); }
    else if (data.ageInDays > 30) { scorePoints += 15; scoreImpacts.push({ description: 'Wallet age > 30 days', value: '+15' }); positiveSignals.push('Active wallet'); }
    else { scorePoints += 0; scoreImpacts.push({ description: 'New wallet', value: '+0' }); riskSignals.push('New wallet'); }
  }

  if (data.txCount !== null) {
    scoreWeights += 30;
    if (data.txCount > 50) { scorePoints += 30; scoreImpacts.push({ description: 'High tx count', value: '+30' }); positiveSignals.push('High transaction count'); }
    else if (data.txCount > 10) { scorePoints += 15; scoreImpacts.push({ description: 'Moderate tx count', value: '+15' }); }
  }

  if (data.interactedContracts !== null) {
    scoreWeights += 20;
    if (data.interactedContracts > 5) { scorePoints += 20; scoreImpacts.push({ description: 'Multiple contract interactions', value: '+20' }); positiveSignals.push('Diverse contract usage'); }
  }

  if (data.largeTransfers !== null) {
    scoreWeights += 20;
    if (data.largeTransfers === 0) { scorePoints += 20; scoreImpacts.push({ description: 'No suspicious large transfers', value: '+20' }); }
    else { scorePoints += 0; scoreImpacts.push({ description: 'Large transfers detected', value: '+0' }); riskSignals.push('Large token transfers detected'); }
  }

  let score = scoreWeights > 0 ? Math.round((scorePoints / scoreWeights) * 100) : null;
  let riskLevel = score === null ? 'Unknown' : score >= 60 ? 'Low Risk' : score >= 40 ? 'Medium Risk' : 'High Risk';
  const { verdict, reason: verdictReason } = calculateVerdict(score);

  return { score, grade: calculateGrade(score), riskLevel, scoreImpacts, keyFindings: [...positiveSignals, ...riskSignals], positiveSignals, riskSignals, smartRecommendations, breakdown, verdict, verdictReason, riskTimeline: null, riskTrend: 'Stable' };
}

function calculateGenericRisk(data: any) {
  let score = 50;
  let riskLevel = 'Medium Risk';
  const { verdict, reason: verdictReason } = calculateVerdict(score);
  return { score, grade: calculateGrade(score), riskLevel, scoreImpacts: [], keyFindings: [], positiveSignals: [], riskSignals: [], smartRecommendations: [], breakdown: { age: null, activity: null, quality: null, behavior: null, network: null }, verdict, verdictReason, riskTimeline: null, riskTrend: 'Stable' };
}

// --- Analysis Endpoints ---

export async function analyzeWallet(address: string) {
  const data = await getWalletData(address);
  const risk = calculateWalletRisk(data);
  const confidence = calculateConfidence(data);
  const pharosNativeScore = calculatePharosNativeScore(data);
  
  const networkInt = getNetworkIntelligence(data);
  const ecosystemInt = getEcosystemIntelligence(data, 'Wallet');
  const badges = generateBadges(data, risk.riskLevel, 'Wallet');
  const analystNotes = generateAnalystNotes('Wallet', risk.score, data);
  const questions = generateFollowUpQuestions('Wallet', risk.score, risk.riskLevel);
  const aiAssessment = await generateAIAssessment('Wallet', address, data, risk.score || 0, risk.riskLevel, risk.keyFindings);

  return {
    entity: address,
    entityType: 'Wallet',
    riskScore: risk.score,
    grade: risk.grade,
    riskLevel: risk.riskLevel,
    scoreImpacts: risk.scoreImpacts,
    keyFindings: risk.keyFindings,
    positiveSignals: risk.positiveSignals,
    riskSignals: risk.riskSignals,
    smartRecommendations: risk.smartRecommendations,
    breakdown: risk.breakdown,
    confidence,
    pharosNativeScore,
    networkIntelligence: networkInt,
    ecosystemIntelligence: ecosystemInt,
    badges,
    analystNotes,
    whaleAnalysis: null,
    verdict: risk.verdict,
    verdictReason: risk.verdictReason,
    riskTimeline: risk.riskTimeline,
    riskTrend: risk.riskTrend,
    questions,
    aiAssessment,
    dataSources: data.dataSources,
    lastUpdated: new Date().toISOString()
  };
}

export async function analyzeToken(address: string) {
  const data = await getTokenData(address);
  const risk = calculateGenericRisk(data);
  const confidence = calculateConfidence(data);
  const pharosNativeScore = calculatePharosNativeScore(data);

  return {
    entity: address,
    entityType: 'Token',
    riskScore: risk.score,
    grade: risk.grade,
    riskLevel: risk.riskLevel,
    scoreImpacts: risk.scoreImpacts,
    keyFindings: risk.keyFindings,
    positiveSignals: risk.positiveSignals,
    riskSignals: risk.riskSignals,
    smartRecommendations: risk.smartRecommendations,
    breakdown: risk.breakdown,
    confidence,
    pharosNativeScore,
    networkIntelligence: getNetworkIntelligence(data),
    ecosystemIntelligence: getEcosystemIntelligence(data, 'Token'),
    badges: generateBadges(data, risk.riskLevel, 'Token'),
    analystNotes: generateAnalystNotes('Token', risk.score, data),
    whaleAnalysis: null,
    verdict: risk.verdict,
    verdictReason: risk.verdictReason,
    riskTimeline: risk.riskTimeline,
    riskTrend: risk.riskTrend,
    questions: generateFollowUpQuestions('Token', risk.score, risk.riskLevel),
    aiAssessment: await generateAIAssessment('Token', address, data, risk.score || 0, risk.riskLevel, risk.keyFindings),
    dataSources: data.dataSources,
    lastUpdated: new Date().toISOString()
  };
}

export async function analyzeContract(address: string) {
  const data = await getContractData(address);
  const risk = calculateGenericRisk(data);
  const confidence = calculateConfidence(data);
  const pharosNativeScore = calculatePharosNativeScore(data);

  return {
    entity: address,
    entityType: 'Contract',
    riskScore: risk.score,
    grade: risk.grade,
    riskLevel: risk.riskLevel,
    scoreImpacts: risk.scoreImpacts,
    keyFindings: risk.keyFindings,
    positiveSignals: risk.positiveSignals,
    riskSignals: risk.riskSignals,
    smartRecommendations: risk.smartRecommendations,
    breakdown: risk.breakdown,
    confidence,
    pharosNativeScore,
    networkIntelligence: getNetworkIntelligence(data),
    ecosystemIntelligence: getEcosystemIntelligence(data, 'Contract'),
    badges: generateBadges(data, risk.riskLevel, 'Contract'),
    analystNotes: generateAnalystNotes('Contract', risk.score, data),
    whaleAnalysis: null,
    verdict: risk.verdict,
    verdictReason: risk.verdictReason,
    riskTimeline: risk.riskTimeline,
    riskTrend: risk.riskTrend,
    questions: generateFollowUpQuestions('Contract', risk.score, risk.riskLevel),
    aiAssessment: await generateAIAssessment('Contract', address, data, risk.score || 0, risk.riskLevel, risk.keyFindings),
    dataSources: data.dataSources,
    lastUpdated: new Date().toISOString()
  };
}

export async function analyzeTransaction(hash: `0x${string}`) {
  const data = await getTransactionData(hash);
  const risk = calculateGenericRisk(data);
  const confidence = calculateConfidence(data);
  const pharosNativeScore = calculatePharosNativeScore(data);

  return {
    entity: hash,
    entityType: 'Transaction',
    riskScore: risk.score,
    grade: risk.grade,
    riskLevel: risk.riskLevel,
    scoreImpacts: risk.scoreImpacts,
    keyFindings: risk.keyFindings,
    positiveSignals: risk.positiveSignals,
    riskSignals: risk.riskSignals,
    smartRecommendations: risk.smartRecommendations,
    breakdown: risk.breakdown,
    confidence,
    pharosNativeScore,
    networkIntelligence: getNetworkIntelligence(data),
    ecosystemIntelligence: getEcosystemIntelligence(data, 'Transaction'),
    badges: generateBadges(data, risk.riskLevel, 'Transaction'),
    analystNotes: generateAnalystNotes('Transaction', risk.score, data),
    whaleAnalysis: null,
    verdict: risk.verdict,
    verdictReason: risk.verdictReason,
    riskTimeline: risk.riskTimeline,
    riskTrend: risk.riskTrend,
    questions: generateFollowUpQuestions('Transaction', risk.score, risk.riskLevel),
    aiAssessment: await generateAIAssessment('Transaction', hash, data, risk.score || 0, risk.riskLevel, risk.keyFindings),
    dataSources: data.dataSources,
    lastUpdated: new Date().toISOString()
  };
}
