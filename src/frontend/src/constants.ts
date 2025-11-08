import { Template } from './types/project';

export const API_URL = 'http://localhost:3001'; // Change this to your backend URL if different

export const stages: string[] = [
    '🧠 Understanding your idea...',
    '🎨 Generating prototype...',
    '📊 Analyzing market data...',
    '💰 Calculating financials...',
    '✅ Complete!'
];

export const templates: Template[] = [
    {
      name: 'E-Commerce Store',
      prompt: 'Online store selling eco-friendly home products with subscription options',
      description: 'Perfect for retail businesses',
      icon: '🛍️'
    },
    {
      name: 'SaaS Platform',
      prompt: 'Project management tool for remote teams with AI-powered insights',
      description: 'Ideal for software services',
      icon: '💻'
    },
    {
      name: 'Mobile App',
      prompt: 'Fitness tracking app with personalized workout plans and nutrition guidance',
      description: 'Great for app ideas',
      icon: '📱'
    },
    {
      name: 'Service Business',
      prompt: 'On-demand home cleaning service with eco-friendly products',
      description: 'For service-based startups',
      icon: '🏠'
    },
    {
      name: 'Marketplace',
      prompt: 'Platform connecting local freelance photographers with event organizers',
      description: 'Two-sided marketplaces',
      icon: '🤝'
    },
    {
      name: 'Subscription Box',
      prompt: 'Monthly curated box of artisanal snacks from local makers',
      description: 'Recurring revenue models',
      icon: '📦'
    }
];