import { useState } from 'react';
import AppPrototype from './AppPrototype';
import BusinessDashboard from './BusinessDashboard';
import FinancialCharts from './FinancialCharts';
import MVPTimeline from './MVPTimeline';
import CostAnalysis from './CostAnalysis';
import { Project } from '../types/project';

interface ResultsViewProps {
    project: Project;
    onStartNew: () => void;
}

export default function ResultsView({ project, onStartNew }: ResultsViewProps) {
    const [activeTab, setActiveTab] = useState<'prototype' | 'analysis' | 'financials' | 'timeline' | 'costs'>('prototype');

    const tabs = [
        { id: 'prototype' as const, label: '🎨 Prototype', icon: '🎨' },
        { id: 'analysis' as const, label: '📊 Analysis', icon: '📊' },
        { id: 'financials' as const, label: '💰 Financials', icon: '💰' },
        { id: 'timeline' as const, label: '🚀 Timeline', icon: '🚀' },
        { id: 'costs' as const, label: '💵 Costs', icon: '💵' },
    ];

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-purple-100 p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-shrink-0 py-3 px-4 rounded-lg font-semibold transition whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>
            {/* Content */}
            {activeTab === 'prototype' && <AppPrototype app={project.app} />}
            {activeTab === 'analysis' && <BusinessDashboard analysis={project.analysis} />}
            {activeTab === 'financials' && project.analysis.financials && (
                <FinancialCharts financials={project.analysis.financials} />
            )}
            {activeTab === 'timeline' && project.analysis.mvpTimeline && (
                <MVPTimeline timeline={project.analysis.mvpTimeline} />
            )}
            {activeTab === 'costs' && project.analysis.financials && (
                <CostAnalysis financials={project.analysis.financials} />
            )}
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