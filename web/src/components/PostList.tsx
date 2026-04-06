import type { DeduplicatedPost } from '../utils/dedup';
import { PostCard } from './PostCard';
import { EmptyState } from './EmptyState';

interface PostListProps {
  posts: DeduplicatedPost[];
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {posts.map(({ post, alsoIn }) => (
        <PostCard key={post.id} post={post} alsoIn={alsoIn} />
      ))}
    </div>
  );
}
