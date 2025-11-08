import { useState } from 'react';
import MainGenerator from './pages/MainGenerator';
import History from './pages/History';
import { Project } from './types/project';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'generate' | 'history'>('generate');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const addProject = (project: Project) => {
    setProjects([project, ...projects]);
    setCurrentProject(project);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                🚀 AI Startup Studio
              </h1>
              <p className="text-sm text-gray-600 mt-1">Your AI Co-Founder in 60 Seconds</p>
            </div>
            {/* Navigation */}
            <nav className="flex gap-2">
              <button
                onClick={() => setCurrentPage('generate')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  currentPage === 'generate'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                ✨ Generate
              </button>
              <button
                onClick={() => setCurrentPage('history')}
                className={`px-6 py-2 rounded-lg font-semibold transition ${
                  currentPage === 'history'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📚 History
              </button>
            </nav>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'generate' && (
          <MainGenerator onProjectComplete={addProject} currentProject={currentProject} />
        )}
        {currentPage === 'history' && (
          <History 
            projects={projects} 
            onSelectProject={setCurrentProject} 
            onNavigateToGenerate={() => setCurrentPage('generate')} 
          />
        )}
      </main>
    </div>
  );
}