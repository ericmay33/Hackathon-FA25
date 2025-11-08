import { Project } from '../types/project';

interface HistoryProps {
    projects: Project[];
    onSelectProject: (project: Project) => void;
    onNavigateToGenerate: () => void;
}

export default function History({ projects, onSelectProject, onNavigateToGenerate }: HistoryProps) {
    if (projects.length === 0) {
        return (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-16 border border-purple-100 text-center">
                <div className="text-6xl mb-4">📚</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Projects Yet</h2>
                <p className="text-gray-600 mb-6">Start by generating your first startup idea!</p>
                <button
                    onClick={onNavigateToGenerate}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                >
                    ✨ Create Your First Project
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Your Project History</h2>
            {projects.map((project) => (
                <div
                    key={project.id}
                    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-100 hover:shadow-xl transition cursor-pointer"
                    onClick={() => {
                        onSelectProject(project);
                        onNavigateToGenerate();
                    }}
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800 mb-2">{project.businessIdea}</h3>
                            <div className="flex gap-4 text-sm text-gray-600">
                                <span>🕒 {new Date(project.createdAt).toLocaleDateString()}</span>
                                {project.targetAudience && <span>👥 {project.targetAudience}</span>}
                                {project.budget && <span>💵 {project.budget}</span>}
                            </div>
                        </div>
                        <button className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition text-sm font-semibold">
                            View →
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}