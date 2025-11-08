// backend/routes/analyze-business.ts
import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const BUSINESS_ANALYSIS_PROMPT = `You are an expert business analyst and venture capital consultant. 
Analyze the given business idea and provide comprehensive startup insights.

Output ONLY valid JSON in this exact format:
{
  "swot": {
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
    "opportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
    "threats": ["threat 1", "threat 2", "threat 3"]
  },
  "marketAnalysis": {
    "targetMarket": "Description of target customers",
    "marketSize": "Estimated TAM/SAM/SOM",
    "competitors": ["competitor 1", "competitor 2", "competitor 3"],
    "trends": [
      {"name": "Trend 1", "impact": "impact level"},
      {"name": "Trend 2", "impact": "impact level"},
      {"name": "Trend 3", "impact": "impact level"}
    ]
  },
  "financials": {
    "pricingStrategy": "Description of pricing approach",
    "revenueStreams": ["stream 1", "stream 2"],
    "initialCosts": {
      "development": "value",
      "marketing": "value",
      "operations": "value"
    },
    "projectedRevenue": {
      "year1": "value",
      "year2": "value",
      "year3": "value"
    }
  },
  "risks": [
    {"name": "Risk 1", "severity": "severity level", "mitigation": "How to address"},
    {"name": "Risk 2", "severity": "severity level", "mitigation": "How to address"},
    {"name": "Risk 3", "severity": "severity level", "mitigation": "How to address"}
  ],
  "keyMetrics": [
    {"name": "industry relevant metric 1", "value": "value", "unit": "unit"},
    {"name": "industry relevant metric 2", "value": "value", "unit": "unit"},
    {"name": "industry relevant metric 3", "value": "value", "unit": "unit"}
  ],
  "elevator pitch": "One compelling sentence about the business"
}`;

interface BusinessAnalysisRequest {
  businessIdea: string;
  targetAudience?: string;
  budget?: string;
}

router.post('/analyze-business', async (req: Request, res: Response) => {
  try {
    const { businessIdea, targetAudience, budget }: BusinessAnalysisRequest = req.body;

    if (!businessIdea || businessIdea.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Business idea is required' 
      });
    }

    // Construct user prompt
    let userPrompt = `Business Idea: ${businessIdea}`;
    if (targetAudience) {
      userPrompt += `\nTarget Audience: ${targetAudience}`;
    }
    if (budget) {
      userPrompt += `\nInitial Budget: ${budget}`;
    }

    console.log('🧠 Analyzing business idea:', businessIdea.substring(0, 50) + '...');

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: BUSINESS_ANALYSIS_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('No response from AI');
    }

    // Parse JSON response
    let analysisData;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      analysisData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw response:', responseText);
      throw new Error('Failed to parse AI response as JSON');
    }

    // Validate required fields
    if (!analysisData.swot || !analysisData.marketAnalysis || !analysisData.financials) {
      throw new Error('AI response missing required fields');
    }

    console.log('✅ Business analysis complete');

    res.json({
      success: true,
      analysis: analysisData,
      generatedAt: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('❌ Business analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze business idea',
      details: error.message 
    });
  }
});

export default router;