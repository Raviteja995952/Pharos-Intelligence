import { Router, Request, Response } from 'express';
import { analyzeWallet, analyzeToken, analyzeContract, analyzeTransaction } from '../services/riskEngine';
import { generateComparativeAssessment } from '../services/aiService';

const router = Router();

router.post('/wallet', async (req: Request, res: Response) => {
  console.log('[API] POST /analyze/wallet request received:', req.body);
  try {
    const { address } = req.body;
    if (!address) {
      console.error('[API] /analyze/wallet Error: Wallet address is required');
      return res.status(400).json({ success: false, message: 'Wallet address is required' });
    }
    const report = await analyzeWallet(address);
    console.log('[API] /analyze/wallet success. Returning report for:', address);
    res.json(report);
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

router.post('/token', async (req: Request, res: Response) => {
  console.log('[API] POST /analyze/token request received:', req.body);
  try {
    const { address } = req.body;
    if (!address) {
      console.error('[API] /analyze/token Error: Token address is required');
      return res.status(400).json({ success: false, message: 'Token address is required' });
    }
    const report = await analyzeToken(address);
    console.log('[API] /analyze/token success. Returning report for:', address);
    res.json(report);
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

router.post('/contract', async (req: Request, res: Response) => {
  console.log('[API] POST /analyze/contract request received:', req.body);
  try {
    const { address } = req.body;
    if (!address) {
      console.error('[API] /analyze/contract Error: Contract address is required');
      return res.status(400).json({ success: false, message: 'Contract address is required' });
    }
    const report = await analyzeContract(address);
    console.log('[API] /analyze/contract success. Returning report for:', address);
    res.json(report);
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

router.post('/transaction', async (req: Request, res: Response) => {
  console.log('[API] POST /analyze/transaction request received:', req.body);
  try {
    const { hash } = req.body;
    if (!hash) {
      console.error('[API] /analyze/transaction Error: Transaction hash is required');
      return res.status(400).json({ success: false, message: 'Transaction hash is required' });
    }
    const report = await analyzeTransaction(hash);
    console.log('[API] /analyze/transaction success. Returning report for:', hash);
    res.json(report);
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

router.post('/compare', async (req: Request, res: Response) => {
  console.log('[API] POST /analyze/compare request received:', req.body);
  try {
    const { address1, address2, type } = req.body;
    if (!address1 || !address2 || !type) {
      return res.status(400).json({ success: false, message: 'address1, address2, and type are required' });
    }

    let report1, report2;
    if (type === 'wallet') {
      report1 = await analyzeWallet(address1);
      report2 = await analyzeWallet(address2);
    } else if (type === 'token') {
      report1 = await analyzeToken(address1);
      report2 = await analyzeToken(address2);
    } else if (type === 'contract') {
      report1 = await analyzeContract(address1);
      report2 = await analyzeContract(address2);
    } else {
      report1 = await analyzeTransaction(address1);
      report2 = await analyzeTransaction(address2);
    }

    const aiComparison = await generateComparativeAssessment(report1, report2, type);

    res.json({
      entity1: report1,
      entity2: report2,
      comparison: aiComparison,
      isComparison: true
    });
  } catch (error: any) {
    console.error("FULL ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

export default router;
