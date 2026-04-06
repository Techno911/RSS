import { SearchX } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <SearchX className="w-12 h-12 mb-3" />
      <p className="text-lg font-medium">Ничего не найдено</p>
      <p className="text-sm mt-1">Попробуйте изменить фильтры или поисковый запрос</p>
    </div>
  );
}
