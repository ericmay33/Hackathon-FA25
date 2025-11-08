interface InfoBlockProps {
    label: string;
    value: string;
}

export default function InfoBlock({ label, value }: InfoBlockProps) {
    return (
        <div>
            <h4 className="font-semibold text-gray-700 mb-1">{label}</h4>
            <p className="text-gray-600">{value}</p>
        </div>
    );
}