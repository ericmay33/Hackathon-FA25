import express, { Request, Response } from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
const SYSTEM_PROMPT = `You are an expert HTML/CSS/JavaScript code generator. Your goal is to create beautiful, functional, self-contained web applications.

RULES:
1. Output ONLY a single HTML file with inline CSS and JavaScript
2. Must be completely self-contained (no external files)
3. Use CDN imports for any libraries (React via CDN is allowed)
4. Keep total code under 200 lines
5. NO server-side code, NO npm packages, NO build steps
6. NO dangerous functions: eval, exec, system calls, file system access
7. Include beautiful, modern styling with gradients and animations
8. Make it mobile-responsive
9. Add helpful comments in the code

STYLING GUIDELINES:
- Use modern CSS (flexbox, grid, animations)
- Add smooth transitions and hover effects
- Use a cohesive color scheme
- Make it visually appealing with gradients or interesting backgrounds
- Ensure good contrast for readability

OUTPUT FORMAT:
Return ONLY the HTML code. No markdown code blocks, no explanations, no preamble.
Start directly with <!DOCTYPE html>`;

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
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `Create a web application that does the following:\n\n${prompt}\n\nMake it functional, beautiful, and user-friendly.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
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

// Generate app
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Invalid prompt provided' });
    }

    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt is too long (max 500 characters)' });
    }

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
});

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