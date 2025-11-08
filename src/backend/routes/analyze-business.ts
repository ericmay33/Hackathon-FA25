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
    "marketSize": "Estimated TAM/SAM/SOM (e.g., $50M)",
    "competitors": ["competitor 1", "competitor 2", "competitor 3"],
    "marketGrowth": "percentage growth rate",
    "trends": [
      {"name": "Trend 1", "impact": 8, "description": "Brief description"},
      {"name": "Trend 2", "impact": 6, "description": "Brief description"},
      {"name": "Trend 3", "impact": 7, "description": "Brief description"}
    ]
  },
  "financials": {
    "pricingStrategy": "Description of pricing approach",
    "revenueStreams": ["stream 1", "stream 2"],
    "initialCosts": {
      "development": "development cost",
      "marketing": "marketing cost",
      "operations": "operations cost",
      "infrastructure": "infrastructure cost",
      "legal": "legal cost",
      "other": "other cost"
    },
    "projectedRevenue": {
      "year1": "projected revenue for year 1",
      "year2": "projected revenue for year 2",
      "year3": "projected revenue for year 3",
      "year4": "projected revenue for year 4",
      "year5": "projected revenue for year 5"
    },
    "monthlyBurnRate": "monthly burn rate",
    "breakEvenMonth": "break even month",
    "totalFundingNeeded": "total funding needed"
  },
  "mvpTimeline": {
    "milestones": [
      {
        "phase": "Discovery & Planning",
        "duration": "duration of discovery & planning",
        "tasks": ["Market research", "User interviews", "Technical architecture", "Design mockups"],
        "cost": "cost of discovery & planning",
        "dependencies": []
      },
      {
        "phase": "Core Development",
        "duration": "duration of core development",
        "tasks": ["Backend development", "Frontend development", "API integration", "Database setup"],
        "cost": "cost of core development",
        "dependencies": ["Discovery & Planning"]
      },
      {
        "phase": "Testing & Refinement",
        "duration": "duration of testing & refinement",
        "tasks": ["QA testing", "Bug fixes", "Performance optimization", "Security audit"],
        "cost": "cost of testing & refinement",
        "dependencies": ["Core Development"]
      },
      {
        "phase": "Launch Preparation",
        "duration": "duration of launch preparation",
        "tasks": ["Marketing setup", "Beta testing", "Documentation", "Launch planning"],
        "cost": "cost of launch preparation",
        "dependencies": ["Testing & Refinement"]
      }
    ],
    "totalDuration": "total duration of the project",
    "launchDate": "6 months from start"
  },
  "risks": [
    {"name": "Risk 1", "severity": 8, "mitigation": "How to address"},
    {"name": "Risk 2", "severity": 6, "mitigation": "How to address"},
    {"name": "Risk 3", "severity": 7, "mitigation": "How to address"}
  ],
  "keyMetrics": [
    {"name": "CAC", "value": "150", "unit": "USD"},
    {"name": "LTV", "value": "1200", "unit": "USD"},
    {"name": "Conversion Rate", "value": "3.5", "unit": "%"}
  ],
  "elevatorPitch": "One compelling sentence about the business"
}

IMPORTANT: 
- All numeric values in financials must be actual numbers (not strings)
- Impact scores in trends must be numbers 1-10
- Market growth must be a number (percentage)
- All cost values must be realistic numbers in USD
- Revenue projections should be realistic and show growth trajectory
- Timeline milestones should be realistic and sequential`;

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