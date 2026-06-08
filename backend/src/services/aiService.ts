import { GoogleGenerativeAI, Schema, SchemaType } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' 
  ? process.env.GEMINI_API_KEY 
  : undefined;

let genAI: GoogleGenerativeAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('[AIService] Failed to initialize Gemini client:', error);
  }
}

function generateRuleBasedFallback(entityType: string, riskScore: number, riskLevel: string, keyFindings: string[]) {
  const entityName = entityType.toLowerCase();
  
  let profile = '';
  if (riskScore >= 70) profile = 'strong trust profile';
  else if (riskScore >= 40) profile = 'moderate risk profile';
  else profile = 'high risk profile';

  let executiveSummary = `This ${entityName} demonstrates a ${profile} with a risk rating of ${riskScore}/100. `;

  if (keyFindings.length > 0) {
    const formattedFindings = keyFindings.map(f => f.charAt(0).toLowerCase() + f.slice(1));
    if (formattedFindings.length === 1) {
      executiveSummary += `The analysis highlights that ${formattedFindings[0]}. `;
    } else {
      const lastFinding = formattedFindings.pop();
      executiveSummary += `The analysis highlights several factors, including ${formattedFindings.join(', ')}, and ${lastFinding}. `;
    }
  }

  let conclusion = '';
  let beginnerExplanation = '';
  
  if (riskLevel === 'Low Risk') {
    conclusion = 'No significant risk factors were identified during analysis.';
    beginnerExplanation = `This ${entityName} has a good history and behaves normally on the network. These are generally positive indicators because malicious entities usually have hidden or very little activity.`;
  } else if (riskLevel === 'Medium Risk') {
    conclusion = 'These indicators highlight mixed usage patterns. Proceed with typical due diligence and carefully verify any smart contract interactions.';
    beginnerExplanation = `This ${entityName} shows some unusual activity but nothing immediately dangerous. You should be careful and double-check before interacting with it.`;
  } else {
    conclusion = 'These indicators strongly suggest highly suspicious or risky activity. Interaction is heavily discouraged.';
    beginnerExplanation = `This ${entityName} is acting suspiciously and shares traits with known scams or attacks. It is highly recommended to avoid interacting with it to keep your assets safe.`;
  }

  return {
    executiveSummary: `${executiveSummary} ${conclusion}`,
    beginnerExplanation
  };
}

export async function generateAIAssessment(entityType: string, entityId: string, data: any, riskScore: number, riskLevel: string, keyFindings: string[] = []) {
  const fallbackResponse = generateRuleBasedFallback(entityType, riskScore, riskLevel, keyFindings);

  if (!genAI) {
    console.warn(`[AIService] Warning: GEMINI_API_KEY is not configured. Returning rule-based fallback.`);
    return fallbackResponse;
  }

  const prompt = `
You are the Pharos Risk Intelligence Agent, an institutional-grade AI in blockchain risk analysis.
Please analyze the following ${entityType} on the Pharos blockchain.

Entity ID: ${entityId}
Risk Score: ${riskScore}/100
Risk Level: ${riskLevel}

Key Findings:
${keyFindings.join(', ')}

Raw Data:
${JSON.stringify(data, null, 2)}

Provide a professional Executive Summary of the risk profile.
Also provide a "Beginner Explanation" that explains the findings in very simple language for a non-technical user.
Keep both concise and professional.
`;

  const responseSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      executiveSummary: {
        type: SchemaType.STRING,
        description: "A professional executive summary of the risk profile, suitable for institutional investors.",
      },
      beginnerExplanation: {
        type: SchemaType.STRING,
        description: "A simple, non-technical explanation of the entity's risk and behavior.",
      },
    },
    required: ["executiveSummary", "beginnerExplanation"],
  };

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("[AIService] Gemini API Error:", error.message);
    return fallbackResponse;
  }
}

export async function generateComparativeAssessment(entity1: any, entity2: any, type: string) {
  const fallbackResponse = {
    assessment: `Based on a deterministic analysis of both ${type}s, ${entity1.riskScore >= entity2.riskScore ? 'Entity A' : 'Entity B'} presents a stronger trust profile. ${entity1.riskScore >= entity2.riskScore ? 'Entity A' : 'Entity B'} scores higher on behavioral stability and network interactions, making it the lower risk option.`,
    winner: entity1.riskScore >= entity2.riskScore ? 'Entity A' : 'Entity B'
  };

  if (!genAI) {
    return fallbackResponse;
  }

  const prompt = `
You are an institutional blockchain intelligence analyst.
Compare two ${type} entities on the Pharos network.

Entity A:
ID: ${entity1.entity}
Score: ${entity1.riskScore}/100
Level: ${entity1.riskLevel}
Key Findings: ${entity1.keyFindings.join(', ')}

Entity B:
ID: ${entity2.entity}
Score: ${entity2.riskScore}/100
Level: ${entity2.riskLevel}
Key Findings: ${entity2.keyFindings.join(', ')}

Provide a comparative assessment explaining which entity is safer and why. Keep it concise.
Return a structured JSON with 'assessment' and 'winner' (either 'Entity A', 'Entity B', or 'Tie').
`;

  const responseSchema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      assessment: { type: SchemaType.STRING },
      winner: { type: SchemaType.STRING }
    },
    required: ["assessment", "winner"],
  };

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (error: any) {
    console.error("[AIService] Gemini Compare API Error:", error.message);
    return fallbackResponse;
  }
}
