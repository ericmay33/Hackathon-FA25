import SWOTSection from './SWOTSection';
import InfoBlock from './InfoBlock';
import { BusinessAnalysis } from '../types/project';

interface BusinessDashboardProps {
    analysis: BusinessAnalysis;
}

export default function BusinessDashboard({ analysis }: BusinessDashboardProps) {
    if (!analysis || Object.keys(analysis).length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                <p className="text-gray-600">No analysis data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Elevator Pitch */}
            {analysis.elevatorPitch && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl p-8 text-white">
                    <h3 className="text-xl font-bold mb-3">🎯 Elevator Pitch</h3>
                    <p className="text-lg leading-relaxed">{analysis.elevatorPitch}</p>
                </div>
            )}
            {/* Key Metrics */}
            {analysis.keyMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {analysis.keyMetrics.map((metric, idx) => (
                        <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100">
                            <div className="text-sm text-gray-600 mb-1">{metric.name}</div>
                            <div className="text-3xl font-bold text-purple-600">
                                {metric.value} <span className="text-lg text-gray-500">{metric.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {/* SWOT Analysis */}
            {analysis.swot && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">💪 SWOT Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <SWOTSection title="✅ Strengths" items={analysis.swot.strengths} color="green" />
                        <SWOTSection title="⚠️ Weaknesses" items={analysis.swot.weaknesses} color="red" />
                        <SWOTSection title="🚀 Opportunities" items={analysis.swot.opportunities} color="blue" />
                        <SWOTSection title="⚡ Threats" items={analysis.swot.threats} color="orange" />
                    </div>
                </div>
            )}
            {/* Market Analysis */}
            {analysis.marketAnalysis && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">🎯 Market Analysis</h3>
                    <div className="space-y-4">
                        <InfoBlock label="Target Market" value={analysis.marketAnalysis.targetMarket} />
                        <InfoBlock label="Market Size" value={analysis.marketAnalysis.marketSize} />
                        {analysis.marketAnalysis.competitors && (
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Key Competitors</h4>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.marketAnalysis.competitors.map((comp, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                            {comp}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Financials */}
            {analysis.financials && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">💰 Financial Overview</h3>
                    <div className="space-y-4">
                        {analysis.financials.pricingStrategy && (
                            <InfoBlock label="Pricing Strategy" value={analysis.financials.pricingStrategy} />
                        )}
                        {analysis.financials.revenueStreams && (
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Revenue Streams</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {analysis.financials.revenueStreams.map((stream, idx) => (
                                        <li key={idx} className="text-gray-600">{stream}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Risks */}
            {analysis.risks && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">⚠️ Risk Assessment</h3>
                    <div className="space-y-4">
                        {analysis.risks.map((risk, idx) => (
                            <div key={idx} className="border-l-4 border-red-500 pl-4">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold text-gray-800">{risk.name}</h4>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        risk.severity >= 7 ? 'bg-red-100 text-red-700' :
                                        risk.severity >= 5 ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                        }`}>
                                        Severity: {risk.severity}/10
                                    </span>
                                </div>
                                {risk.mitigation && (
                                    <p className="text-gray-600 text-sm">
                                        <strong>Mitigation:</strong> {risk.mitigation}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}