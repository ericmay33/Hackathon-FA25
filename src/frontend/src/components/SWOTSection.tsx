interface SWOTSectionProps {
    title: string;
    items: string[];
    color: 'green' | 'red' | 'blue' | 'orange';
}

export default function SWOTSection({ title, items, color }: SWOTSectionProps) {
    const colors = {
        green: 'border-green-500',
        red: 'border-red-500',
        blue: 'border-blue-500',
        orange: 'border-orange-500'
    };

    return (
        <div>
            <h4 className="font-semibold text-gray-700 mb-3">{title}</h4>
            <ul className="space-y-2">
                {items.map((item, idx) => (
                    <li key={idx} className={`text-gray-700 pl-4 border-l-2 ${colors[color]}`}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}