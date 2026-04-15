import { Search, ArrowDownWideNarrow } from 'lucide-react';
import type { SortMode } from '../types';

interface HeaderProps {
  postCount: number;
  channelCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
}

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: 'date', label: 'По дате' },
  { value: 'views', label: 'По просмотрам' },
  { value: 'reactions', label: 'По реакциям' },
];

export function Header({ postCount, channelCount, searchQuery, onSearchChange, sortMode, onSortChange }: HeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">📡</span>
        <h1 className="text-2xl font-bold text-gray-900">AI Digest</h1>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Дайджест Telegram-каналов об AI · {postCount} постов из {channelCount} каналов
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск по постам..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-colors"
          />
        </div>
        <div className="relative">
          <ArrowDownWideNarrow className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="pl-8 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 appearance-none cursor-pointer"
          >
            {SORT_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
