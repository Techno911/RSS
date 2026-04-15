export interface Reaction {
  emoji: string;
  count: string;
  countNum: number;
}

export interface TelegramPost {
  id: string;
  channel: string;
  channelTitle: string;
  messageId: number;
  text: string;
  textHtml: string;
  date: string;
  views: string;
  viewsNum: number;
  reactions: Reaction[];
  reactionsTotal: number;
  imageUrl: string | null;
  url: string;
}

export interface ChannelMeta {
  handle: string;
  title: string;
  avatarUrl: string;
  postCount: number;
}

export interface DigestData {
  generatedAt: string;
  channels: ChannelMeta[];
  posts: TelegramPost[];
}

export type TimePeriod = '24h' | '3d' | '7d' | 'all';
export type SortMode = 'date' | 'views' | 'reactions';
