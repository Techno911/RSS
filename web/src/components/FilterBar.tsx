import { X, Eye } from 'lucide-react';
import type { TimePeriod } from '../types';

interface FilterBarProps {
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  channelCounts: Map<string, { title: string; count: number }>;
  selectedChannels: Set<string>;
  onToggleChannel: (handle: string) => void;
  onClearChannels: () => void;
  totalCount: number;
  hiddenChannels: Set<string>;
  onHideChannel: (handle: string) => void;
  onRestoreChannel: (handle: string) => void;
  onRestoreAll: () => void;
}

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: '24h', label: '24ч' },
  { value: '3d', label: '3 дня' },
  { value: '7d', label: 'Неделя' },
  { value: 'all', label: 'Все' },
];

export function FilterBar({
  timePeriod,
  onTimePeriodChange,
  channelCounts,
  selectedChannels,
  onToggleChannel,
  onClearChannels,
  totalCount,
  hiddenChannels,
  onHideChannel,
  onRestoreChannel,
  onRestoreAll,
}: FilterBarProps) {
  const sortedChannels = Array.from(channelCounts.entries())
    .filter(([handle]) => !hiddenChannels.has(handle))
    .sort((a, b) => b[1].count - a[1].count);

  const hiddenWithTitles = Array.from(channelCounts.entries())
    .filter(([handle]) => hiddenChannels.has(handle));

  return (
    <div className="mb-6">
      {/* Time period */}
      <div className="flex items-center gap-2 mb-3">
        {TIME_PERIODS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onTimePeriodChange(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              timePeriod === value
                ? 'bg-[#F97316] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Channel tags */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onClearChannels}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            selectedChannels.size === 0
              ? 'bg-[#F97316] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Все ({totalCount})
        </button>
        {sortedChannels.map(([handle, { title, count }]) => {
          const isSelected = selectedChannels.has(handle);
          return (
            <span
              key={handle}
              className={`group inline-flex items-center gap-0.5 rounded-full text-sm transition-colors ${
                isSelected
                  ? 'bg-[#F97316] text-white font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <button
                onClick={() => onToggleChannel(handle)}
                className="pl-3 py-1"
              >
                {title} ({count})
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onHideChannel(handle);
                }}
                className={`pr-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                  isSelected ? 'hover:text-white/70' : 'hover:text-red-500'
                }`}
                title={`Скрыть ${title}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          );
        })}
      </div>

      {/* Hidden channels restore */}
      {hiddenWithTitles.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-400">Скрытые:</span>
          {hiddenWithTitles.map(([handle, { title }]) => (
            <button
              key={handle}
              onClick={() => onRestoreChannel(handle)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors border border-dashed border-gray-200"
            >
              <Eye className="w-3 h-3" />
              {title}
            </button>
          ))}
          {hiddenWithTitles.length > 1 && (
            <button
              onClick={onRestoreAll}
              className="text-xs text-[#F97316] hover:underline"
            >
              Вернуть все
            </button>
          )}
        </div>
      )}
    </div>
  );
}
