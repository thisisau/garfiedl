import { InfiniteElementList } from "../components/list";
import NavPanel from "../components/nav_panel";
import { PostPreview } from "../components/post";
import supabase from "../supabase/client";
import { Post } from "../types/posts";

export default function Following() {
  return (
    <div id="page-container">
      <div className="content">
        <div className="home-panels">
          <NavPanel />
          <div className="center-panel">
            <div className="post-list">
              <InfiniteElementList
                itemsPerLoad={5}
                loadItems={async (start, count) => {
                  const { data, error } = await supabase
                    .from("followed_posts")
                    .select()
                    .range(start, start + count - 1);

                  console.log(data);
                  if (error) throw error;
                  if (data === null) return [];
                  return data.map((e) => <PostPreview post={e as Post} />);
                }}
                emptyMessage={
                  <div className="nav-header section">You aren't following any users yet! Follow some to populate this page.</div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
