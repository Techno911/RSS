import type { TelegramPost } from '../types';
import { PostCard } from './PostCard';
import { EmptyState } from './EmptyState';

interface PostListProps {
  posts: TelegramPost[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
