import { useState } from 'react';
import { AppPrototypeData } from '../types/project';

interface AppPrototypeProps {
    app: AppPrototypeData;
}

export default function AppPrototype({ app }: AppPrototypeProps) {
    const [showCode, setShowCode] = useState(false);

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">🎨 Your Prototype</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                        {showCode ? 'Hide Code' : 'View Code'}
                    </button>
                    {app.url && (
                        <a
                            href={app.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                        >
                            Open Full Screen ↗
                        </a>
                    )}
                </div>
            </div>
            {/* Browser Frame */}
            <div className="bg-gray-900 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 bg-gray-800 rounded px-3 py-1 text-sm text-gray-400">
                        {app.url || 'preview'}
                    </div>
                </div>
                <iframe
                    srcDoc={app.code}
                    className="w-full h-[600px] bg-white rounded"
                    title="Generated App"
                    sandbox="allow-scripts"
                />
            </div>
            {showCode && (
                <details open className="mt-4">
                    <summary className="cursor-pointer text-purple-600 font-semibold hover:text-purple-700 mb-2">
                        Source Code
                    </summary>
                    <pre className="p-4 bg-gray-900 text-green-400 rounded-lg overflow-x-auto text-sm max-h-96">
                        {app.code}
                    </pre>
                </details>
            )}
        </div>
    );
}