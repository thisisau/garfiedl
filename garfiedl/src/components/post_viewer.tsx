import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Post } from "../types/posts";
import { PostPreview } from "./post";
import { useEffect, useState } from "react";
import supabase from "../supabase/client";
import { getPost, getReplies } from "../functions/post";
import { filterProps } from "framer-motion";
import { LinkIconWithTooltip } from "./tooltip";
import MainHeader from "./header";
import { InfiniteElementList } from "./list";

export default function PostViewer() {
  const params = useParams();
  const navigate = useNavigate();
  return (
    <div id="page-container">
      <MainHeader />
      <div className="content">
        <div className="home-panels">
          <div className="center-panel">
            <div className="nav-header section">
              <LinkIconWithTooltip
                tooltip="Back"
                className="icon-container"
                to={"/"}
                onClick={(e) => {
                  e.preventDefault();
                  const beforeLocation = window.location.href;
                  navigate(-1);
                  setTimeout(() => {
                    const afterLocation = window.location.href;
                    if (beforeLocation === afterLocation) navigate("/");
                  }, 100);
                }}
                src="/icons/arrow-left.svg"
              />
              <span>Post</span>
              <div className="icon-container" />
            </div>
            <SinglePost key={params.postID} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SinglePost() {
  const params = useParams();
  const location = useLocation();

  const [post, setPost] = useState<
    { data: Post; error: false } | { data: null; error?: boolean }
  >({
    data: null,
    error: false,
  });

  const postID = (() => {
    const id = params.postID;
    try {
      return Number(id);
    } catch (e) {
      setPost({
        data: null,
        error: true,
      });
      return -1;
    }
  })();

  useEffect(() => {
    window.history.replaceState(
      post ? { post } : null,
      "",
      window.location.href.split("?")[0]
    );
  }, []);

  useEffect(() => {
    if (post.error || post.data !== null) return;

    if (location.state?.post) {
      setPost({
        data: location.state?.post,
        error: false,
      });
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const contentKey = params.get("contentKey");
    if (contentKey) {
      const storageKey = `post-cached-${contentKey}`;
      const content = sessionStorage.getItem(storageKey);
      sessionStorage.removeItem(storageKey);
      const post = JSON.parse(content ?? "null");
      if (post) {
        setPost({
          data: post,
          error: false,
        });
      }
      return;
    }

    supabase
      .from("posts")
      .select()
      .eq("id", postID)
      .then((value) => {
        const data = value.data;

        if (data === null) {
          setPost({
            data: null,
            error: true,
          });
          return;
        }

        setPost({
          data: data[0],
          error: false,
        });
      });
  }, [post]);

  if (post.error) {
    return (
      <div className="post-list">
        <div className="post-error">
          An error occured when trying to fetch this post.
        </div>
      </div>
    );
  } else if (post.data === null) {
    return (
      <div className="post-list">
        <div className="post-preview section loading">
          <l-dot-pulse color="white" />
        </div>
      </div>
    );
  }

  return (
    <div className="post-list">
      <div className="reverse-replies reply-chain">
        {post.data.type === "reply" && (
          <RecursiveReplyViewer
            reverse
            post={post.data}
            maxDepth={3}
            skipNextPost
          />
        )}
        <PostPreview post={post.data} displayData={{ noLink: [postID] }} />
      </div>
      {post.data.replies > 0 && <hr className="gray" />}
      <PostReplies postID={post.data.id} />
    </div>
  );
}

export function PostReplies(props: {
  postID: number;
  start?: number;
  end?: number;
}) {
  return (
    <div className="reply-list">
      <InfiniteElementList
        itemsPerLoad={5}
        loadItems={async (start, count) => {
          const replies = await getReplies(props.postID, {
            start,
            count,
            order: "recent",
          });
          return replies.map((e) => (
            <div className="reply-chain">
              <RecursiveReplyViewer maxDepth={3} post={e} reverse={false} />
            </div>
          ));
        }}
      />
    </div>
  );
}

export function RecursiveReplyViewer(props: {
  maxDepth: number;
  post: Post;
  reverse: boolean;
  skipNextPost?: boolean;
}) {
  const [nextReply, setNextReply] = useState<Post | undefined>(undefined);

  useEffect(() => {
    if (props.maxDepth < 1) return;

    if (!props.reverse) {
      getReplies(props.post.id, {
        start: 0,
        count: 1,
        order: "popular",
      }).then((replies) => {
        if (replies.length === 0) return;

        const reply = replies[0];

        if (reply.likes > props.post.likes / 5 - 1) setNextReply(reply);
      });
    } else {
      if (props.post.reference !== null)
        getPost(props.post.reference).then((post) => {
          if (post === null) return;

          setNextReply(post);
        });
    }
  }, []);

  return (
    <>
      {nextReply && props.reverse && (
        <RecursiveReplyViewer
          maxDepth={props.maxDepth - 1}
          post={nextReply}
          reverse
        />
      )}
      {!props.skipNextPost && <PostPreview post={props.post} />}
      {nextReply && !props.reverse && (
        <RecursiveReplyViewer
          maxDepth={props.maxDepth - 1}
          post={nextReply}
          reverse={false}
        />
      )}
    </>
  );
}
