import supabase from "../supabase/client";
import { Post } from "../types/posts";

/**
 *
 * @param postID The ID of the post to view replies for
 * @param options.start The first reply, by zero-based index, to
 */
export async function getReplies(
  postID: number,
  options: {
    start: number;
    count: number;
    order: "popular" | "recent";
  }
): Promise<Array<Post>> {
  const start = options.start;
  const count = options.count;

  let filter = supabase.from("posts").select();
  filter = filter.eq("type", "reply").eq("reference", postID);
  if (options.order === "popular")
    filter = filter.order("likes", { ascending: false, nullsFirst: false });
  else
    filter = filter.order("created_at", {
      ascending: false,
      nullsFirst: false,
    });

  filter = filter.range(start, start + count - 1);

  const { data, error } = await filter;

  if (error) throw error;
  return data;
}

export async function getPost(postID: number) {
  const { data } = await supabase.from("posts").select().eq("id", postID);
  if (data === null) return null;
  else if (data.length === 0) return null;
  return data[0];
}
