import { useState, useMemo, useCallback } from 'react';
import { digestData } from './data';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { Trending } from './components/Trending';
import { PostList } from './components/PostList';
import { AddChannel } from './components/AddChannel';
import { filterPosts, filterByTime, countByChannel } from './utils/filters';
import { deduplicatePosts } from './utils/dedup';
import type { TimePeriod, SortMode } from './types';

const HIDDEN_KEY = 'digest-hidden-channels';

function loadHidden(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function saveHidden(set: Set<string>) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...set]));
}

export default function App() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('7d');
  const [selectedChannels, setSelectedChannels] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('date');
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(loadHidden);

  const handleHideChannel = useCallback((handle: string) => {
    setHiddenChannels((prev) => {
      const next = new Set(prev);
      next.add(handle);
      saveHidden(next);
      return next;
    });
    setSelectedChannels((prev) => {
      if (!prev.has(handle)) return prev;
      const next = new Set(prev);
      next.delete(handle);
      return next;
    });
  }, []);

  const handleRestoreChannel = useCallback((handle: string) => {
    setHiddenChannels((prev) => {
      const next = new Set(prev);
      next.delete(handle);
      saveHidden(next);
      return next;
    });
  }, []);

  const handleRestoreAll = useCallback(() => {
    setHiddenChannels(new Set());
    saveHidden(new Set());
  }, []);

  const timeFilteredPosts = useMemo(
    () => filterByTime(digestData.posts, timePeriod),
    [timePeriod],
  );

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
    () => filterPosts(digestData.posts, { timePeriod, selectedChannels, searchQuery })
      .filter((p) => !hiddenChannels.has(p.channel)),
    [timePeriod, selectedChannels, searchQuery, hiddenChannels],
  );

  const dedupedPosts = useMemo(() => {
    const deduped = deduplicatePosts(filteredPosts);
    // Sort
    if (sortMode === 'views') {
      return [...deduped].sort((a, b) => b.post.viewsNum - a.post.viewsNum);
    }
    if (sortMode === 'reactions') {
      return [...deduped].sort((a, b) => b.post.reactionsTotal - a.post.reactionsTotal);
    }
    return deduped; // already sorted by date from parser
  }, [filteredPosts, sortMode]);

  // Trending: top 5 posts by views for the current time period (excluding hidden)
  const trendingPosts = useMemo(() => {
    const visible = timeFilteredPosts.filter((p) => !hiddenChannels.has(p.channel));
    return [...visible]
      .sort((a, b) => b.viewsNum - a.viewsNum)
      .slice(0, 5);
  }, [timeFilteredPosts, hiddenChannels]);

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

  const visibleForCounts = useMemo(
    () => postsForChannelCounts.filter((p) => !hiddenChannels.has(p.channel)),
    [postsForChannelCounts, hiddenChannels],
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Header
        postCount={dedupedPosts.length}
        channelCount={Array.from(channelCounts.keys()).filter((h) => !hiddenChannels.has(h)).length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortMode={sortMode}
        onSortChange={setSortMode}
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
        totalCount={visibleForCounts.length}
        hiddenChannels={hiddenChannels}
        onHideChannel={handleHideChannel}
        onRestoreChannel={handleRestoreChannel}
        onRestoreAll={handleRestoreAll}
      />
      {!searchQuery && selectedChannels.size === 0 && trendingPosts.length > 0 && (
        <Trending posts={trendingPosts} />
      )}
      <AddChannel />
      <PostList posts={dedupedPosts} />
    </div>
  );
}
