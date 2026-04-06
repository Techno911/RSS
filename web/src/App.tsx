import { useState, useMemo, useCallback } from 'react';
import { digestData } from './data';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PostList } from './components/PostList';
import { AddChannel } from './components/AddChannel';
import { filterPosts, filterByTime, countByChannel } from './utils/filters';
import { deduplicatePosts } from './utils/dedup';
import type { TimePeriod } from './types';

export default function App() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7d');
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const timeFilteredPosts = useMemo(
    () => filterByTime(digestData.posts, timePeriod),
    [timePeriod],
  );

  // Channel counts respect both time and search filters (but not channel selection)
  const postsForChannelCounts = useMemo(() => {
    let result = timeFilteredPosts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.text.toLowerCase().includes(q));
    }
    return result;
  }, [timeFilteredPosts, searchQuery]);

  const channelCounts = useMemo(
    () => countByChannel(postsForChannelCounts),
    [postsForChannelCounts],
  );

  const filteredPosts = useMemo(
    () => filterPosts(digestData.posts, { timePeriod, selectedChannels, searchQuery }),
    [timePeriod, selectedChannels, searchQuery],
  );

  const dedupedPosts = useMemo(
    () => deduplicatePosts(filteredPosts),
    [filteredPosts],
  );

  const handleToggleChannel = useCallback((handle: string) => {
    setSelectedChannels((prev) => {
      const next = new Set(prev);
      if (next.has(handle)) {
        next.delete(handle);
      } else {
        next.add(handle);
      }
      return next;
    });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Header
        postCount={dedupedPosts.length}
        channelCount={channelCounts.size}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <FilterBar
        timePeriod={timePeriod}
        onTimePeriodChange={(p) => {
          setTimePeriod(p);
          setSelectedChannels(new Set());
        }}
        channelCounts={channelCounts}
        selectedChannels={selectedChannels}
        onToggleChannel={handleToggleChannel}
        onClearChannels={() => setSelectedChannels(new Set())}
        totalCount={postsForChannelCounts.length}
      />
      <PostList posts={dedupedPosts} />
      <AddChannel />
    </div>
  );
}
