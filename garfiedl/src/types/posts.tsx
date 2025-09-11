export type Post = {
  id: number;
  created_at: string;
  body: string;
  link: string | null;
  comic: string | null;
  likes: number;
  replies: number;
  author: string | null;
  type: PostType;
  reference: number | null;
};

export type PostDisplayData = {
  repost?: {author: {id: string | null; displayName: string}, createdAt: string};
  referenceStack?: Array<number>;
  quote?: boolean;
  noLink?: Array<number>;
}

export type PostType = "post" | "repost" | "quote" | "reply";