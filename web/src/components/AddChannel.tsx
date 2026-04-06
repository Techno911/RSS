import { useState } from 'react';
import { Plus, X, ExternalLink } from 'lucide-react';

const GITHUB_REPO = 'Techno911/RSS';

export function AddChannel() {
  const [isOpen, setIsOpen] = useState(false);
  const [channel, setChannel] = useState('');

  const handleSubmit = () => {
    const handle = channel.trim().replace(/^@/, '').replace(/^https?:\/\/t\.me\//, '');
    if (!handle) return;

    // Open .env file on GitHub for editing — user adds the channel and commits
    const url = `https://github.com/${GITHUB_REPO}/edit/main/.env`;
    window.open(url, '_blank');
    setChannel('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="mt-8 flex justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-[#F97316] hover:text-[#F97316] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить канал
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800">Добавить канал</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="@channel или ссылка t.me/channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400"
        />
        <button
          onClick={handleSubmit}
          disabled={!channel.trim()}
          className="px-4 py-2 rounded-lg bg-[#F97316] text-white text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          Открыть <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Откроется файл .env на GitHub — добавь хендл канала через запятую в строку CHANNELS и закоммить. Дайджест обновится автоматически.
      </p>
    </div>
  );
}
