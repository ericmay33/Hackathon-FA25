import dotenv from 'dotenv';
// Load environment variables FIRST before any other imports that might need them
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import analyzeBusinessRouter from './routes/analyze-business';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// Allow all origins in development (more permissive)
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['http://localhost:5173', 'http://localhost:3000'] 
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
  next();
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
const APPS_FILE = path.join(DATA_DIR, 'apps.json');

// Types
interface AppData {
  id: string;
  prompt: string;
  code: string;
  url: string;
  timestamp: string;
  status: 'live' | 'archived';
  views?: number;
}

// Dangerous patterns to block
const BLOCKED_PATTERNS = [
  /os\./gi,
  /exec\(/gi,
  /eval\(/gi,
  /child_process/gi,
  /fs\./gi,
  /__import__/gi,
  /require\(['"](fs|os|child_process)/gi,
  /import.*\(fs|os|child_process\)/gi,
];

// System prompt for code generation
const SYSTEM_PROMPT = `You are an expert frontend developer and UI/UX designer tasked with creating **complex, visually impressive, modern websites** using only HTML, CSS (inlined or via <style>), and optional inline JavaScript.  

Your output must look like a **real, professional, production-quality website or app** that can be displayed directly in a browser without any build tools or servers.

### OBJECTIVE
Generate a **fully self-contained, single HTML file** that brings the user's idea to life as a beautiful, functional, and responsive web app or landing page.

### RULES
1. Return ONLY valid HTML (starting with <!DOCTYPE html>).
2. Use clean, semantic HTML5 structure (header, nav, main, section, footer, etc.).
3. Include CSS inside <style> tags. You may also use inline <script> for light interactivity.
4. You may import **external CDNs** for fonts, icons, and frameworks:
   - Google Fonts
   - Font Awesome icons
   - Tailwind CSS via CDN
   - Chart.js (for visualizations)
   - AOS or animate.css for animations
5. Aim for visually **stunning**, **responsive**, and **modern** UI/UX.
6. Use **layout systems** like Flexbox and Grid.
7. Add **animations**, **hover effects**, and **transitions**.
8. Use **consistent color palettes** and **beautiful typography**.
9. Add sections, cards, gradients, buttons, and hero headers.
10. Never use eval, exec, filesystem, or server code.
11. Keep it under ~400 lines (focus on design quality, not brevity).
12. It should render well standalone in the browser frontend.

### STYLING & DESIGN
- Include a hero section with gradient backgrounds or large imagery.
- Use soft shadows, rounded corners, and layered visual hierarchy.
- Use smooth transitions and hover effects for buttons and cards.
- Include placeholder images (e.g. via https://picsum.photos/ or unsplash.com).
- Make the layout responsive (mobile and desktop).
- Add at least a few content components: hero, features, pricing, testimonials, contact, etc.
- Use engaging visual balance — spacing, alignment, and color contrast.

Example features you may include when relevant:
- Dashboard layouts
- Interactive forms
- Charts or stats
- Image galleries
- Landing pages with calls-to-action
- Portfolios
- Product showcases

OUTPUT FORMAT:
Return ONLY the complete HTML code with inline CSS. No markdown code blocks, no explanations, no preamble.
Start directly with <!DOCTYPE html>
Include everything needed for a stunning, production-ready landing page.`;

// Utility functions
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

async function readApps(): Promise<AppData[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(APPS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeApps(apps: AppData[]): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(APPS_FILE, JSON.stringify(apps, null, 2));
}

async function saveApp(app: AppData): Promise<void> {
  const apps = await readApps();
  apps.unshift(app);
  if (apps.length > 100) {
    apps.length = 100;
  }
  await writeApps(apps);
}

async function getApp(id: string): Promise<AppData | null> {
  const apps = await readApps();
  return apps.find(app => app.id === id) || null;
}

async function getAllApps(limit: number = 50): Promise<AppData[]> {
  const apps = await readApps();
  return apps.slice(0, limit);
}

async function incrementViews(id: string): Promise<void> {
  const apps = await readApps();
  const app = apps.find(a => a.id === id);
  if (app) {
    app.views = (app.views || 0) + 1;
    await writeApps(apps);
  }
}

function sanitizeCode(code: string): string {
  let cleaned = code.replace(/```html\n?/g, '').replace(/```\n?/g, '');
  
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(cleaned)) {
      throw new Error('Generated code contains unsafe operations');
    }
  }
  
  if (!cleaned.trim().toLowerCase().startsWith('<!doctype html>')) {
    throw new Error('Generated code is not valid HTML');
  }
  
  return cleaned.trim();
}

async function generateCode(prompt: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using the more powerful model for better quality output
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Create an absolutely stunning, premium landing page for this business:\n\n${prompt}\n\nCreate a world-class landing page with:\n- Hero section with background image\n- Features section with flexbox layout\n- Benefits section\n- Social proof/testimonials\n- Strong call-to-action\n\nUse inline CSS with flexbox for all layouts. Use high-quality Unsplash background images. Make it look like a premium, multi-million dollar startup's website. NO JavaScript - pure HTML and inline CSS only.\n\nIMPORTANT: Create a COMPLETE, DETAILED landing page with extensive CSS styling. Include multiple sections, beautiful typography, gradients, shadows, and modern design elements. Make it look absolutely stunning and professional.`,
        },
      ],
      temperature: 0.9, // Higher creativity
      max_tokens: 16000, // Doubled token limit for more detailed output
    });

    const code = completion.choices[0].message.content;
    
    if (!code) {
      throw new Error('No code generated');
    }

    return sanitizeCode(code);
  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    throw new Error(`Failed to generate code: ${error.message}`);
  }
}

// Routes

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount business analysis route
app.use('/api', analyzeBusinessRouter);

// Generate app handler
async function handleGenerateApp(req: Request, res: Response) {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt provided' });
    }

    // No prompt length limit - allow detailed business descriptions

    const appId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Generating code for:', prompt);
    const code = await generateCode(prompt);
    console.log('Code generated successfully');

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const url = `${frontendUrl}/app/${appId}`;

    const appData: AppData = {
      id: appId,
      prompt,
      code,
      url,
      timestamp: new Date().toISOString(),
      status: 'live',
      views: 0,
    };

    await saveApp(appData);
    console.log('App saved to storage');

    res.json({
      success: true,
      app: appData,
    });

  } catch (error: any) {
    console.error('API Error:', error);
    res.status(500).json({
      error: 'Failed to generate app',
      message: error.message,
    });
  }
}

// Generate app endpoints (both for compatibility)
app.post('/api/generate', handleGenerateApp);
app.post('/api/generate-app', handleGenerateApp);

// Get all apps
app.get('/api/apps', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const apps = await getAllApps(limit);
    res.json({ apps });
  } catch (error: any) {
    console.error('Error fetching apps:', error);
    res.status(500).json({ error: 'Failed to fetch apps' });
  }
});

// Get single app
app.get('/api/apps/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const app = await getApp(id);
    
    if (!app) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Increment views
    await incrementViews(id);
    
    res.json({ app });
  } catch (error: any) {
    console.error('Error fetching app:', error);
    res.status(500).json({ error: 'Failed to fetch app' });
  }
});

// Get app stats
app.get('/api/stats', async (req: Request, res: Response) => {
  try {
    const apps = await readApps();
    const stats = {
      totalApps: apps.length,
      liveApps: apps.filter(a => a.status === 'live').length,
      totalViews: apps.reduce((sum, app) => sum + (app.views || 0), 0),
    };
    res.json(stats);
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  ensureDataDir();
});