import { TrendingUp, Eye } from 'lucide-react';
import type { TelegramPost } from '../types';

interface TrendingProps {
  posts: TelegramPost[];
}

export function Trending({ posts }: TrendingProps) {
  return (
    <div className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-[#F97316]" />
        <h2 className="text-sm font-semibold text-gray-800">Топ по просмотрам</h2>
      </div>
      <div className="space-y-2">
        {posts.map((post, i) => (
          <a
            key={post.id}
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 group"
          >
            <span className="text-xs font-bold text-[#F97316] w-4 shrink-0 pt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-800 group-hover:text-[#F97316] transition-colors line-clamp-1">
                {post.text.substring(0, 120) || '(медиа)'}
              </p>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                <span>{post.channelTitle || post.channel}</span>
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {post.views}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
