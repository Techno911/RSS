import type { TimePeriod } from '../types';

interface FilterBarProps {
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
  channelCounts: Map<string, { title: string; count: number }>;
  selectedChannels: Set<string>;
  onToggleChannel: (handle: string) => void;
  onClearChannels: () => void;
  totalCount: number;
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
}: FilterBarProps) {
  const sortedChannels = Array.from(channelCounts.entries()).sort((a, b) => b[1].count - a[1].count);

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
            <button
              key={handle}
              onClick={() => onToggleChannel(handle)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                isSelected
                  ? 'bg-[#F97316] text-white font-medium'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {title} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
