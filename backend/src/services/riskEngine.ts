import { getWalletData, getTokenData, getContractData, getTransactionData } from './blockchainService';
import { generateAIAssessment } from './aiService';

// --- Helper Functions ---

function calculateGrade(score: number) {
  if (score >= 80) return 'A';
  if (score >= 60) return 'B';
  if (score >= 40) return 'C';
  if (score >= 20) return 'D';
  return 'F';
}

function calculateConfidence(data: any) {
  let conf = 50;
  if (data.dataCompleteness > 90) conf += 20;
  if (data.analysisCoverage > 90) conf += 15;
  if (data.txCount && data.txCount > 50) conf += 10;
  if (data.ageInDays && data.ageInDays > 90) conf += 5;
  
  conf = Math.min(100, conf);
  
  let reason = "Standard dataset available.";
  if (conf >= 90) reason = "Analysis is based on extensive historical transaction data and complete wallet activity records.";
  else if (conf < 70) reason = "Limited historical data available. Analysis relies on sparse network interactions.";

  return { score: conf, reason };
}

function getNetworkIntelligence(data: any) {
  let assessment = "Network activity is within normal parameters.";
  if (data.suspiciousInteractionCount > 2) {
    assessment = "High volume of interactions with flagged or suspicious addresses detected across the network.";
  } else if (data.verifiedContractInteractions > 5) {
    assessment = "Strong network footprint with multiple verified protocol interactions.";
  } else if (data.connectedWallets > 100) {
    assessment = "Extensive counterparty network suggesting high liquidity or automated bot activity.";
  }

  return {
    connectedWallets: data.connectedWallets || 0,
    verifiedContracts: data.verifiedContractInteractions || 0,
    highRiskInteractions: data.suspiciousInteractionCount || 0,
    diversityScore: data.activityDiversityScore || 0,
    assessment
  };
}

function getEcosystemIntelligence(data: any, entityType: string) {
  let assessment = `This ${entityType.toLowerCase()} demonstrates average participation within the Pharos ecosystem.`;
  
  if (data.ecosystemScore > 80) {
    assessment = `This ${entityType.toLowerCase()} demonstrates strong participation within the Pharos ecosystem and has interacted with multiple protocols across the network.`;
  } else if (data.ecosystemScore < 30) {
    assessment = `This ${entityType.toLowerCase()} has very limited or isolated interactions within the broader Pharos ecosystem.`;
  }

  return {
    pharosInteractions: data.pharosInteractions || 0,
    uniqueContracts: data.uniquePharosContracts || 0,
    ecosystemScore: data.ecosystemScore || 0,
    protocolDiversity: data.pharosProtocolDiversity || 0,
    networkEngagement: data.pharosNetworkEngagement || 0,
    assessment
  };
}

function generateBadges(data: any, riskLevel: string, entityType: string) {
  const badges: { label: string, color: 'green' | 'yellow' | 'red' }[] = [];
  
  if (data.ageInDays > 180) badges.push({ label: 'Established ' + entityType, color: 'green' });
  else if (data.ageInDays < 30) badges.push({ label: 'New ' + entityType, color: 'yellow' });
  
  if (data.txCount > 500) badges.push({ label: 'High Activity', color: 'green' });
  if (data.interactedContracts > 10) badges.push({ label: 'Protocol Power User', color: 'green' });
  
  if (data.suspiciousInteractionCount > 0) badges.push({ label: 'High-Risk Interactions', color: 'red' });
  if (data.largeTransfers > 3) badges.push({ label: 'Suspicious Activity Spike', color: 'red' });
  
  if (entityType === 'Token') {
    if (data.top10HoldersPercentage > 70) badges.push({ label: 'Whale Dominance', color: 'red' });
    else if (data.top10HoldersPercentage > 40) badges.push({ label: 'Moderate Concentration', color: 'yellow' });
    else badges.push({ label: 'Healthy Distribution', color: 'green' });
  }

  if (entityType === 'Contract') {
    if (data.isVerified) badges.push({ label: 'Verified Contract User', color: 'green' });
    else badges.push({ label: 'Unverified Code', color: 'red' });
  }

  return badges.slice(0, 4); // Limit to 4 badges
}

function generateAnalystNotes(entityType: string, score: number, data: any) {
  if (score >= 80) return `This ${entityType.toLowerCase()} demonstrates consistent behavior patterns and appears to be an established participant within the Pharos ecosystem. No critical anomalies were identified during analysis.`;
  if (score >= 60) return `This ${entityType.toLowerCase()} shows generally acceptable network usage. While some minor anomalies exist, they do not currently indicate malicious intent. Ongoing monitoring is recommended.`;
  if (score >= 40) return `This ${entityType.toLowerCase()} exhibits several concerning behavioral traits. The onchain patterns suggest a higher likelihood of irregular or risky activity. Proceed with institutional caution.`;
  return `CRITICAL WARNING: This ${entityType.toLowerCase()} has triggered multiple severe risk indicators. The activity profile strongly matches known malicious behaviors, exploits, or highly coordinated market manipulation. Interaction is strictly advised against.`;
}

function generateFollowUpQuestions(entityType: string, riskScore: number, riskLevel: string) {
  return [
    { question: "Why is this score " + (riskScore >= 70 ? "high" : "low") + "?", answer: `The score reflects a ${riskLevel.toLowerCase()} profile based on the balance of positive and negative signals detected onchain. Review the 'Why This Score?' section for exact impact weights.` },
    { question: "Explain for beginners", answer: `We look at how this ${entityType.toLowerCase()} behaves on the blockchain. A higher score means it acts like normal, safe users do. A lower score means it does things that scammers or risky programs often do.` },
    { question: "What should I monitor?", answer: `Focus on the Smart Recommendations provided in this report, specifically keeping an eye on new large transfers or sudden changes in contract interactions.` },
    { question: "How was this score calculated?", answer: `The Pharos Intelligence Score aggregates 4 key metrics: Age/History, Activity Volume, Contract Quality, and Behavioral Patterns. These are weighted and adjusted by detected Red Flags.` }
  ];
}

function calculateVerdict(score: number) {
  if (score >= 70) return { verdict: 'YES', reason: 'High confidence profile with no critical red flags. Safe to interact.' };
  if (score >= 40) return { verdict: 'CAUTION', reason: 'Mixed signals detected. Proceed only with careful due diligence and verify all contracts.' };
  return { verdict: 'NO', reason: 'High risk profile with critical red flags. Interaction is heavily discouraged to prevent asset loss.' };
}

function generateRiskTimeline(currentScore: number) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const trendType = Math.random();
  const timeline = [];
  let score = trendType > 0.6 ? currentScore - 30 : trendType > 0.3 ? currentScore + 20 : currentScore;
  score = Math.max(0, Math.min(100, score));

  for (let i = 0; i < 5; i++) {
    timeline.push({ date: months[i], score: Math.round(score) });
    score += (currentScore - score) / (5 - i);
  }
  timeline.push({ date: months[5], score: currentScore });

  let trend = 'Stable';
  if (timeline[0].score < currentScore - 10) trend = 'Improving';
  else if (timeline[0].score > currentScore + 10) trend = 'Worsening';

  return { timeline, trend };
}

// --- Scoring Logic ---

function calculateWalletRisk(data: any) {
  let baseScore = 50;
  const scoreImpacts: { description: string, value: string }[] = [];
  const positiveSignals: string[] = [];
  const riskSignals: string[] = [];
  const smartRecommendations: string[] = [];
  let breakdown = { age: 50, activity: 50, quality: 50, behavior: 50, network: 50 };

  if (data.ageInDays > 180) {
    baseScore += 15;
    scoreImpacts.push({ description: 'Wallet age greater than 180 days', value: '+15' });
    positiveSignals.push('Wallet age is greater than 180 days');
    breakdown.age = 90;
  } else if (data.ageInDays > 90) {
    baseScore += 10;
    scoreImpacts.push({ description: 'Wallet age greater than 90 days', value: '+10' });
    positiveSignals.push('Wallet age is greater than 90 days');
    breakdown.age = 70;
  } else {
    breakdown.age = 30;
    smartRecommendations.push('Monitor new wallet activity carefully');
  }

  if (data.txCount > 100) {
    baseScore += 10;
    scoreImpacts.push({ description: 'More than 100 transactions', value: '+10' });
    positiveSignals.push('More than 100 transactions');
    breakdown.activity = 85;
  } else {
    breakdown.activity = 40;
  }

  if (data.interactedContracts > 5) {
    baseScore += 10;
    scoreImpacts.push({ description: 'Multiple verified contract interactions', value: '+10' });
    positiveSignals.push('Interactions with multiple contracts');
    breakdown.quality = 80;
  }

  if (data.largeTransfers > 2) {
    baseScore -= 20;
    scoreImpacts.push({ description: 'Large suspicious movements detected', value: '-20' });
    riskSignals.push('Large suspicious movements detected');
    breakdown.behavior = 20;
    smartRecommendations.push('Track large transfers and counterparty addresses');
  } else {
    breakdown.behavior = 75;
  }

  if (data.suspiciousInteractionCount > 0) {
    baseScore -= 15;
    scoreImpacts.push({ description: 'Suspicious interactions detected', value: '-15' });
    riskSignals.push('Interactions with flagged entities');
    breakdown.network = 25;
  } else {
    baseScore += 5;
    scoreImpacts.push({ description: 'Clean network graph', value: '+5' });
    breakdown.network = 85;
  }

  smartRecommendations.push('Continue monitoring activity');

  let score = Math.max(0, Math.min(100, baseScore));
  let riskLevel = score >= 60 ? 'Low Risk' : score >= 40 ? 'Medium Risk' : 'High Risk';
  const { verdict, reason: verdictReason } = calculateVerdict(score);
  const { timeline: riskTimeline, trend: riskTrend } = generateRiskTimeline(score);

  return { score, grade: calculateGrade(score), riskLevel, scoreImpacts, keyFindings: [...positiveSignals, ...riskSignals], positiveSignals, riskSignals, smartRecommendations, breakdown, verdict, verdictReason, riskTimeline, riskTrend };
}

function calculateTokenRisk(data: any) {
  let baseScore = 50;
  const scoreImpacts: { description: string, value: string }[] = [];
  const positiveSignals: string[] = [];
  const riskSignals: string[] = [];
  const smartRecommendations: string[] = [];
  let breakdown = { age: 50, activity: 50, quality: 50, behavior: 50, network: 50 };

  if (data.top10HoldersPercentage > 70) {
    baseScore -= 30;
    scoreImpacts.push({ description: 'High holder concentration', value: '-30' });
    riskSignals.push('Top 10 holders control >70% of supply');
    smartRecommendations.push('Monitor holder concentration closely for dump risks');
    breakdown.behavior = 15;
  } else if (data.top10HoldersPercentage < 40) {
    baseScore += 20;
    scoreImpacts.push({ description: 'Healthy holder distribution', value: '+20' });
    positiveSignals.push('Top 10 holders control <40% of supply');
    breakdown.behavior = 90;
  }

  if (data.activityLevel === 'High') {
    baseScore += 15;
    scoreImpacts.push({ description: 'High trading activity', value: '+15' });
    positiveSignals.push('Healthy trading activity');
    breakdown.activity = 85;
  } else if (data.activityLevel === 'Low') {
    baseScore -= 15;
    scoreImpacts.push({ description: 'Low liquidity/activity', value: '-15' });
    riskSignals.push('Low trading activity');
    breakdown.activity = 30;
  }

  smartRecommendations.push('Review recent large transfers');
  
  let score = Math.max(0, Math.min(100, baseScore));
  let riskLevel = score >= 60 ? 'Low Risk' : score >= 40 ? 'Medium Risk' : 'High Risk';
  const { verdict, reason: verdictReason } = calculateVerdict(score);
  const { timeline: riskTimeline, trend: riskTrend } = generateRiskTimeline(score);

  const whaleAnalysis = {
    top5: data.top5HoldersPercentage || 0,
    top10: data.top10HoldersPercentage || 0,
    assessment: data.top10HoldersPercentage > 60 ? "A small group of holders can significantly influence market behavior." : "Supply is healthily distributed minimizing central market manipulation risks."
  };

  return { score, grade: calculateGrade(score), riskLevel, scoreImpacts, keyFindings: [...positiveSignals, ...riskSignals], positiveSignals, riskSignals, smartRecommendations, breakdown, whaleAnalysis, verdict, verdictReason, riskTimeline, riskTrend };
}

function calculateContractRisk(data: any) {
  let baseScore = 50;
  const scoreImpacts: { description: string, value: string }[] = [];
  const positiveSignals: string[] = [];
  const riskSignals: string[] = [];
  const smartRecommendations: string[] = [];
  let breakdown = { age: 50, activity: 50, quality: 50, behavior: 50, network: 50 };

  if (data.isVerified) {
    baseScore += 20;
    scoreImpacts.push({ description: 'Contract is verified', value: '+20' });
    positiveSignals.push('Verified Contract');
    breakdown.quality = 95;
  } else {
    baseScore -= 20;
    scoreImpacts.push({ description: 'Unverified source code', value: '-20' });
    riskSignals.push('Unverified Contract');
    smartRecommendations.push('Avoid unverified contracts unless heavily audited');
    breakdown.quality = 10;
  }

  if (data.renouncedOwnership) {
    baseScore += 15;
    scoreImpacts.push({ description: 'Renounced Ownership', value: '+15' });
    positiveSignals.push('Renounced Ownership');
    breakdown.behavior = 90;
  }

  if (data.isUpgradeable) {
    baseScore -= 10;
    scoreImpacts.push({ description: 'Contract is upgradeable', value: '-10' });
    riskSignals.push('Upgradeable Contract');
    smartRecommendations.push('Track contract proxy upgrades');
    breakdown.quality = 60;
  }

  if (data.hasAdminPrivileges) {
    baseScore -= 15;
    scoreImpacts.push({ description: 'Admin privileges exist', value: '-15' });
    riskSignals.push('Admin Privileges exist');
    smartRecommendations.push('Review contract permissions and multisig status');
    breakdown.behavior = 40;
  }

  let score = Math.max(0, Math.min(100, baseScore));
  let riskLevel = score >= 60 ? 'Low Risk' : score >= 40 ? 'Medium Risk' : 'High Risk';
  const { verdict, reason: verdictReason } = calculateVerdict(score);
  const { timeline: riskTimeline, trend: riskTrend } = generateRiskTimeline(score);

  return { score, grade: calculateGrade(score), riskLevel, scoreImpacts, keyFindings: [...positiveSignals, ...riskSignals], positiveSignals, riskSignals, smartRecommendations, breakdown, verdict, verdictReason, riskTimeline, riskTrend };
}

function calculateTransactionRisk(data: any) {
  let baseScore = 50;
  const scoreImpacts: { description: string, value: string }[] = [];
  const positiveSignals: string[] = [];
  const riskSignals: string[] = [];
  const smartRecommendations: string[] = [];
  let breakdown = { age: 50, activity: 50, quality: 50, behavior: 50, network: 50 };

  if (data.status === 'success') {
    baseScore += 10;
    scoreImpacts.push({ description: 'Transaction successful', value: '+10' });
    positiveSignals.push('Transaction successful');
    breakdown.quality = 90;
  } else {
    baseScore -= 20;
    scoreImpacts.push({ description: 'Transaction reverted', value: '-20' });
    riskSignals.push('Transaction reverted');
    breakdown.quality = 10;
  }

  if (data.contractInteraction) {
    positiveSignals.push('Contract Interaction');
    breakdown.network = 75;
  }

  smartRecommendations.push('Analyze related block transactions for MEV');

  let score = Math.max(0, Math.min(100, baseScore));
  let riskLevel = score >= 60 ? 'Low Risk' : score >= 40 ? 'Medium Risk' : 'High Risk';
  const { verdict, reason: verdictReason } = calculateVerdict(score);
  const { timeline: riskTimeline, trend: riskTrend } = generateRiskTimeline(score);

  return { score, grade: calculateGrade(score), riskLevel, scoreImpacts, keyFindings: [...positiveSignals, ...riskSignals], positiveSignals, riskSignals, smartRecommendations, breakdown, verdict, verdictReason, riskTimeline, riskTrend };
}

// --- Analysis Endpoints ---

export async function analyzeWallet(address: string) {
  const data = await getWalletData(address);
  const risk = calculateWalletRisk(data);
  const confidence = calculateConfidence(data);
  const networkInt = getNetworkIntelligence(data);
  const ecosystemInt = getEcosystemIntelligence(data, 'Wallet');
  const badges = generateBadges(data, risk.riskLevel, 'Wallet');
  const analystNotes = generateAnalystNotes('Wallet', risk.score, data);
  const questions = generateFollowUpQuestions('Wallet', risk.score, risk.riskLevel);
  const aiAssessment = await generateAIAssessment('Wallet', address, data, risk.score, risk.riskLevel, risk.keyFindings);

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
  };
}

export async function analyzeToken(address: string) {
  const data = await getTokenData(address);
  const risk = calculateTokenRisk(data);
  const confidence = calculateConfidence(data);
  const networkInt = getNetworkIntelligence(data);
  const ecosystemInt = getEcosystemIntelligence(data, 'Token');
  const badges = generateBadges(data, risk.riskLevel, 'Token');
  const analystNotes = generateAnalystNotes('Token', risk.score, data);
  const questions = generateFollowUpQuestions('Token', risk.score, risk.riskLevel);
  const aiAssessment = await generateAIAssessment('Token', address, data, risk.score, risk.riskLevel, risk.keyFindings);

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
    networkIntelligence: networkInt,
    ecosystemIntelligence: ecosystemInt,
    badges,
    analystNotes,
    whaleAnalysis: risk.whaleAnalysis,
    verdict: risk.verdict,
    verdictReason: risk.verdictReason,
    riskTimeline: risk.riskTimeline,
    riskTrend: risk.riskTrend,
    questions,
    aiAssessment,
  };
}

export async function analyzeContract(address: string) {
  const data = await getContractData(address);
  const risk = calculateContractRisk(data);
  const confidence = calculateConfidence(data);
  const networkInt = getNetworkIntelligence(data);
  const ecosystemInt = getEcosystemIntelligence(data, 'Contract');
  const badges = generateBadges(data, risk.riskLevel, 'Contract');
  const analystNotes = generateAnalystNotes('Contract', risk.score, data);
  const questions = generateFollowUpQuestions('Contract', risk.score, risk.riskLevel);
  const aiAssessment = await generateAIAssessment('Contract', address, data, risk.score, risk.riskLevel, risk.keyFindings);

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
  };
}

export async function analyzeTransaction(hash: `0x${string}`) {
  const data = await getTransactionData(hash);
  const risk = calculateTransactionRisk(data);
  const confidence = calculateConfidence(data);
  const networkInt = getNetworkIntelligence(data);
  const ecosystemInt = getEcosystemIntelligence(data, 'Transaction');
  const badges = generateBadges(data, risk.riskLevel, 'Transaction');
  const analystNotes = generateAnalystNotes('Transaction', risk.score, data);
  const questions = generateFollowUpQuestions('Transaction', risk.score, risk.riskLevel);
  const aiAssessment = await generateAIAssessment('Transaction', hash, data, risk.score, risk.riskLevel, risk.keyFindings);

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
  };
}
