import { useState } from 'react';
import AppPrototype from './AppPrototype';
import BusinessDashboard from './BusinessDashboard';
import { Project } from '../types/project';

interface ResultsViewProps {
    project: Project;
    onStartNew: () => void;
}

export default function ResultsView({ project, onStartNew }: ResultsViewProps) {
    const [activeTab, setActiveTab] = useState<'prototype' | 'analysis'>('prototype');

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('prototype')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                            activeTab === 'prototype'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        🎨 App Prototype
                    </button>
                    <button
                        onClick={() => setActiveTab('analysis')}
                        className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                            activeTab === 'analysis'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        📊 Business Analysis
                    </button>
                </div>
            </div>
            {/* Content */}
            {activeTab === 'prototype' && <AppPrototype app={project.app} />}
            {activeTab === 'analysis' && <BusinessDashboard analysis={project.analysis} />}
            {/* Start New Button */}
            <button
                onClick={onStartNew}
                className="w-full py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
                ← Start New Project
            </button>
        </div>
    );
}