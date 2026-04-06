import { useState, useMemo, useCallback } from 'react';
import { digestData } from './data';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { PostList } from './components/PostList';
import { AddChannel } from './components/AddChannel';
import { filterPosts, filterByTime, countByChannel } from './utils/filters';
import { deduplicatePosts } from './utils/dedup';
import type { TimePeriod } from './types';

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
  const [hiddenChannels, setHiddenChannels] = useState<Set<string>>(loadHidden);

  const handleHideChannel = useCallback((handle: string) => {
    setHiddenChannels((prev) => {
      const next = new Set(prev);
      next.add(handle);
      saveHidden(next);
      return next;
    });
    // Also deselect if it was selected
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

  // Filter posts also excluding hidden channels
  const filteredPosts = useMemo(
    () => filterPosts(digestData.posts, { timePeriod, selectedChannels, searchQuery })
      .filter((p) => !hiddenChannels.has(p.channel)),
    [timePeriod, selectedChannels, searchQuery, hiddenChannels],
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

  // Visible post count for header (exclude hidden)
  const visibleForCounts = useMemo(
    () => postsForChannelCounts.filter((p) => !hiddenChannels.has(p.channel)),
    [postsForChannelCounts, hiddenChannels],
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Header
        postCount={dedupedPosts.length}
        channelCount={channelCounts.size - hiddenChannels.size}
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
        totalCount={visibleForCounts.length}
        hiddenChannels={hiddenChannels}
        onHideChannel={handleHideChannel}
        onRestoreChannel={handleRestoreChannel}
        onRestoreAll={handleRestoreAll}
      />
      <AddChannel />
      <PostList posts={dedupedPosts} />
    </div>
  );
}
