import { Sparkles } from 'lucide-react';

interface WeeklySummaryProps {
  summary: string;
}

export function WeeklySummary({ summary }: WeeklySummaryProps) {
  if (!summary) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl border border-violet-100 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-violet-500" />
        <h2 className="text-sm font-semibold text-gray-800">Обзор недели</h2>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{summary}</p>
    </div>
  );
}
