import { useState } from 'react';
import { Project, Template } from './types/project';
import { API_URL } from './constants';
import ResultsView from './components/ResultsView';

interface MainGeneratorProps {
  onProjectComplete: (project: Project | null) => void;
  currentProject: Project | null;
}

export default function MainGenerator({ onProjectComplete, currentProject }: MainGeneratorProps) {
  const [businessIdea, setBusinessIdea] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [budget, setBudget] = useState('');
  const [useTemplate, setUseTemplate] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const stages = [
    '🧠 Understanding your idea...',
    '🎨 Generating prototype...',
    '📊 Analyzing market data...',
    '💰 Calculating financials...',
    '✅ Complete!'
  ];

  const templates = [
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

  const handleGenerate = async () => {
    if (!businessIdea.trim()) {
      setError('Please enter a business idea or choose a template');
      return;
    }

    setLoading(true);
    setError('');
    setStage(0);

    // Progress simulation
    const interval = setInterval(() => {
      setStage(prev => {
        if (prev < stages.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 1500);

    try {
      // CALL BOTH ENDPOINTS IN PARALLEL
      const [appResponse, analysisResponse] = await Promise.all([
        // SHAWN'S ENDPOINT
        fetch(`${API_URL}/api/generate-app`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: businessIdea })
        }),
        // ERIC'S ENDPOINT
        fetch(`${API_URL}/api/analyze-business`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessIdea,
            targetAudience: targetAudience || undefined,
            budget: budget || undefined
          })
        })
      ]);

      const appData = await appResponse.json();
      const analysisData = await analysisResponse.json();

      if (!appResponse.ok || !analysisResponse.ok) {
        throw new Error('Generation failed');
      }

      clearInterval(interval);
      setStage(stages.length - 1);

      // Combine results
      const project = {
        id: Date.now(),
        businessIdea,
        targetAudience,
        budget,
        app: appData.app || appData,
        analysis: analysisData.analysis || analysisData,
        createdAt: new Date().toISOString()
      };

      onProjectComplete(project);

    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : 'Failed to generate startup package');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = (template: Template) => {
    setBusinessIdea(template.prompt);
    setUseTemplate(template.name);
    setShowTemplates(false);
  };

  if (currentProject) {
    return <ResultsView project={currentProject} onStartNew={() => onProjectComplete(null)} />;
  }

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">💡 Describe Your Startup Idea</h2>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-semibold"
          >
            {showTemplates ? 'Hide Templates' : '📋 Use Template'}
          </button>
        </div>

        {/* Template Selector */}
        {showTemplates && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map((template, idx) => (
              <button
                key={idx}
                onClick={() => applyTemplate(template)}
                className="text-left p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition border border-purple-200"
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <div className="font-semibold text-gray-800 mb-1">{template.name}</div>
                <div className="text-xs text-gray-600">{template.description}</div>
              </button>
            ))}
          </div>
        )}

        {useTemplate && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200 flex items-center justify-between">
            <span className="text-sm text-purple-700">
              <strong>Using template:</strong> {useTemplate}
            </span>
            <button
              onClick={() => {
                setUseTemplate(null);
                setBusinessIdea('');
              }}
              className="text-purple-600 hover:text-purple-800 text-sm"
            >
              ✕ Clear
            </button>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Business Idea * <span className="text-gray-500 font-normal">(Be specific!)</span>
            </label>
            <textarea
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              placeholder="Example: A mobile app that helps busy professionals meal prep by connecting them with local chefs who deliver pre-portioned ingredients and recipes weekly..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={5}
              disabled={loading}
            />
            <div className="mt-1 text-xs text-gray-500">
              💡 Tip: Include your target customer, main problem solved, and unique approach
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Audience (Optional)
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="E.g., Working professionals aged 25-40"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Budget (Optional)
              </label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="E.g., $25,000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !businessIdea.trim()}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? stages[stage] : '✨ Generate My Startup Package'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            ❌ {error}
          </div>
        )}

        {/* Progress Visualization */}
        {loading && (
          <div className="mt-6 space-y-2">
            {stages.map((s, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  idx === stage
                    ? 'bg-purple-100 border-2 border-purple-500'
                    : idx < stage
                    ? 'bg-green-50 border border-green-300'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    idx === stage
                      ? 'bg-purple-500 animate-pulse'
                      : idx < stage
                      ? 'bg-green-500'
                      : 'bg-gray-300'
                  }`}
                />
                <span className={`text-sm ${idx <= stage ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}