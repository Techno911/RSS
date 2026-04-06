import { Eye, Heart, ExternalLink } from 'lucide-react';
import type { TelegramPost } from '../types';
import { timeAgo } from '../utils/formatters';

interface PostCardProps {
  post: TelegramPost;
}

export function PostCard({ post }: PostCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header: channel + time */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-500">
          @{post.channel}
          {post.channelTitle && post.channelTitle !== post.channel && (
            <span className="font-normal text-gray-400 ml-1.5">{post.channelTitle}</span>
          )}
        </span>
        <span className="text-sm text-gray-400 whitespace-nowrap ml-2">{timeAgo(post.date)}</span>
      </div>

      {/* Text */}
      {post.text && (
        <p className="text-gray-800 text-sm leading-relaxed" style={{
          display: '-webkit-box',
          WebkitLineClamp: 5,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {post.text}
        </p>
      )}

      {/* Image */}
      {post.imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img
            src={post.imageUrl}
            alt=""
            loading="lazy"
            className="w-full max-h-52 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Footer: views + reactions + open link */}
      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
        {post.views && (
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {post.views}
          </span>
        )}
        {post.reactionsTotal > 0 && (
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {post.reactions.map((r, i) => (
              <span key={i}>{r.emoji}{r.count}</span>
            )).reduce((prev, curr, i) => i === 0 ? [curr] : [...prev, <span key={`s${i}`} className="mx-0.5">·</span>, curr], [] as React.ReactNode[])}
          </span>
        )}
        <span className="flex-1" />
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#F97316] font-medium hover:underline"
        >
          Открыть <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
