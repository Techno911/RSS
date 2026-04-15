import DOMPurify from 'dompurify';
import { Eye, ExternalLink } from 'lucide-react';
import type { TelegramPost } from '../types';
import { timeAgo } from '../utils/formatters';

interface PostCardProps {
  post: TelegramPost;
  alsoIn?: string[]; // other channel titles that posted the same content
}

export function PostCard({ post, alsoIn }: PostCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header: channel title + time */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-gray-800 truncate">
            {post.channelTitle || post.channel}
          </span>
          <span className="text-xs text-gray-400 shrink-0">@{post.channel}</span>
        </div>
        <span className="text-sm text-gray-400 whitespace-nowrap ml-2">{timeAgo(post.date)}</span>
      </div>

      {/* Also posted in */}
      {alsoIn && alsoIn.length > 0 && (
        <div className="mb-2 text-xs text-gray-400">
          Также в: {alsoIn.join(', ')}
        </div>
      )}

      {/* Full text */}
      {post.textHtml ? (
        <div
          className="text-gray-800 text-sm leading-relaxed prose prose-sm max-w-none prose-a:text-[#F97316] prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.textHtml, { ADD_ATTR: ['target'] }) }}
        />
      ) : post.text ? (
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line">
          {post.text}
        </p>
      ) : null}

      {/* Image */}
      {post.imageUrl && (
        <div className="mt-3 rounded-lg overflow-hidden">
          <img
            src={post.imageUrl}
            alt=""
            loading="lazy"
            className="w-full max-h-80 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      {/* Footer: views + reactions + open link */}
      <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
        {post.views && (
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {post.views}
          </span>
        )}
        {post.reactionsTotal > 0 && (
          <span className="flex items-center gap-1 flex-wrap">
            {post.reactions.map((r, i) => (
              <span key={i} className="inline-flex items-center gap-0.5">
                {r.emoji}<span className="text-xs">{r.count}</span>
              </span>
            ))}
          </span>
        )}
        <span className="flex-1" />
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[#F97316] font-medium hover:underline shrink-0"
        >
          Открыть <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
