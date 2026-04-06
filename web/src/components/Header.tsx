import { Search } from 'lucide-react';

interface HeaderProps {
  postCount: number;
  channelCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ postCount, channelCount, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">📡</span>
        <h1 className="text-2xl font-bold text-gray-900">AI Digest</h1>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Дайджест Telegram-каналов об AI · {postCount} постов из {channelCount} каналов
      </p>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по постам..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-colors"
        />
      </div>
    </div>
  );
}
