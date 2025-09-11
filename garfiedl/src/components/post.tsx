import { useEffect, useState } from "react";
import { useStateObj } from "../functions/hooks";
import supabase from "../supabase/client";
import { Post, PostDisplayData } from "../types/posts";
import { useAddAlert, useClearAlertID } from "./alerts/alert_hooks";
import Button from "./input/button";
import { Modal } from "./modal";
import { UUID } from "crypto";
import {
  Link,
  redirect,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import ComicViewer from "./comic_viewer";
import { Comic } from "../types/sprites";
import PostCreator, { DEFAULT_COMIC, useOpenPostDraft } from "./post_creator";
import { ElementWithTooltip, LinkIconWithTooltip } from "./tooltip";
import { useSession } from "../supabase/hooks";
import { concatClasses, formatDate, simpleHash } from "../functions/functions";
import { Dropdown } from "./input/dropdown";
import { ReportPost } from "./report";
import { InfiniteElementList } from "./list";

export default function MainPostList() {
  return (
    <div className="post-list">
      <InfiniteElementList
        itemsPerLoad={5}
        loadItems={async (start, count) => {
          const { data, error } = await supabase
            .from("suggested_posts")
            .select()
            .range(start, start + count - 1);
          if (error) throw error;
          if (data === null) return [];
          return data.map((e) => <PostPreview post={e as Post} />);
        }}
      />
    </div>
  );
}

export function PostPreview(props: {
  post: Post;
  displayData?: PostDisplayData;
}) {
  const [author, setAuthor] = useState({
    id: props.post.author,
    displayName: "Unknown User",
  });

  const addAlert = useAddAlert();
  const openPostDraft = useOpenPostDraft();

  const navigate = useNavigate();

  const [post, updatePost] = useStateObj(props.post);
  const referenceStack = props.displayData?.referenceStack
    ? props.displayData.referenceStack.concat(post.id)
    : [post.id];

  const session = useSession();

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (post.author === null) return;
    supabase.rpc("get_user_info", { user_id: post.author }).then((response) => {
      const data = response.data;
      if (typeof data !== "object" || Array.isArray(data)) return;
      if (data === null) return;
      setAuthor({
        id: data["id"] as UUID,
        displayName: data["display_name"] as string,
      });
    });
  }, []);

  useEffect(() => {
    supabase
      .rpc("post_is_liked", {
        post_id: post.id,
      })
      .then(({ data }) => {
        if (data !== null) setLiked(data);
      });
  }, []);

  if (
    post.reference !== null &&
    !referenceStack.slice(0, -1).includes(post.id)
  ) {
    if (post.type === "repost") {
      return (
        <OnlinePost
          displayData={{
            ...props.displayData,
            referenceStack: referenceStack,
            repost: props.displayData?.repost ?? {
              author,
              createdAt: post.created_at,
            },
          }}
          postID={post.reference}
        />
      );
    }
  }

  const openPost = () => navigate(`/post/${post.id}`, { state: { post } });
  const openPostInNewTab = () => {
    const cachedID = window.crypto.randomUUID();
    sessionStorage.setItem(`post-cached-${cachedID}`, JSON.stringify(post));
    const params = new URLSearchParams();
    params.set("contentKey", cachedID);
    window.open(`/post/${post.id}?${params.toString()}`, "_blank");
  };

  const isNotLinkable = props.displayData?.noLink;

  return (
    <div
      className={concatClasses(
        "post-preview section undecorated",
        !props.displayData?.noLink?.includes(post.id) && "link-to-post"
      )}
      // state={{
      //   post
      // }}
      // to={`/post/${post.id}`}
      draggable={false}
    >
      <div
        className={concatClasses(
          "icon-container profile-picture",
          author.id === null && "unknown-user"
        )}
      >
        {author.id === null ? (
          <span>?</span>
        ) : (
          <img
            src={`/sprites/custom/garfiedl/${
              simpleHash(author.id ?? "Unknown User") % 6
            }.svg`}
          />
        )}
      </div>

      <div className="post-content">
        <div className="information">
          <div className="author">
            <span>
              {author.id ? (
                <Link to={`/user/${author.displayName}`}>
                  {author.displayName}
                </Link>
              ) : (
                author.displayName
              )}
            </span>
          </div>

          <div className="date">
            <ElementWithTooltip
              tooltip={formatDate(new Date(post.created_at), "very-long")}
            >
              <span>
                {formatDate(new Date(post.created_at), "short-adapt")}
              </span>
            </ElementWithTooltip>
          </div>
          {props.displayData?.repost &&
            props.displayData.referenceStack?.length === 1 && (
              <div className="repost-author">
                <ElementWithTooltip
                  tooltip={`ReGarfed on ${formatDate(
                    new Date(props.displayData.repost.createdAt),
                    "very-long"
                  )}`}
                >
                  <span>
                    ReGarfed by{" "}
                    <Link
                      to={`/user/${props.displayData.repost.author.displayName}`}
                    >
                      {props.displayData.repost.author.displayName}
                    </Link>
                  </span>
                </ElementWithTooltip>
              </div>
            )}
          {!props.displayData?.quote && (
            <Dropdown
              containerClass="options"
              header={
                <div className="head icon-container">
                  <img src="/icons/more-horizontal.svg" />
                </div>
              }
            >
              <Button
                color="dark"
                onClick={async (e) => {
                  const url = `${window.location.protocol}//${window.location.host}/post/${post.id}`;
                  if (navigator.canShare && navigator.canShare())
                    await navigator.share({
                      url: `${window.location.protocol}//${window.location.host}/post/${post.id}`,
                    });
                  else await navigator.clipboard.writeText(url);
                  (e.target as HTMLButtonElement).textContent = "Copied!";
                }}
              >
                <div className="icon-container">
                  <img src="/icons/share.svg" />
                </div>
                <span>
                  {navigator.canShare && navigator.canShare()
                    ? "Share Post"
                    : "Copy Post URL"}
                </span>
              </Button>
              {session?.data.user?.id === post.author && (
                <Button
                  color="dark"
                  onClick={(e) => {
                    addAlert((clear) => (
                      <Modal title="Delete Post">
                        <div>
                          <div>
                            Are you sure you would like to delete this post?
                            This action cannot be undone.
                          </div>
                          <p />
                          <div>
                            <Button onClick={clear}>No, Cancel</Button>{" "}
                            <Button
                              onClick={async () => {
                                const { error } = await supabase
                                  .from("posts")
                                  .delete()
                                  .eq("id", post.id);

                                if (error) {
                                  addAlert(
                                    <Modal title="Error">{error.message}</Modal>
                                  );
                                  return;
                                }

                                (e.target as HTMLButtonElement)
                                  .closest(".post-preview")
                                  ?.remove();

                                clear();
                              }}
                            >
                              Yes, Delete
                            </Button>
                          </div>
                        </div>
                      </Modal>
                    ));
                  }}
                >
                  <div className="icon-container">
                    <img src="/icons/trash.svg" />
                  </div>
                  <span>Delete Post</span>
                </Button>
              )}
              {session?.data.user?.id &&
                session.data.user.id !== post.author && (
                  <Button
                    color="dark"
                    onClick={() => {
                      addAlert((_, replace) => (
                        <Modal title="Report Post" flexibleHeight width={640}>
                          <ReportPost
                            post={post}
                            author={author}
                            onSubmit={async (body) => {
                              const { error } = await supabase.rpc(
                                "report_post",
                                {
                                  post_id: post.id,
                                  report_body: body.reason,
                                }
                              );

                              if (error) {
                                replace(
                                  <Modal title="Error">{error.message}</Modal>
                                );
                                return;
                              }

                              replace(
                                <Modal title="Success!">
                                  This post has been reported. We will notify
                                  you if we take any action.
                                </Modal>
                              );
                            }}
                          />
                        </Modal>
                      ));
                    }}
                  >
                    <div className="icon-container">
                      <img src="/icons/flag.svg" />
                    </div>
                    <span>Report Post</span>
                  </Button>
                )}
              <Button
                color="dark"
                onClick={async (e) => {
                  await navigator.clipboard.writeText(post.body);
                  (e.target as HTMLButtonElement).textContent = "Copied!";
                }}
                className={concatClasses(post.body === "" && "no-access")}
              >
                <div className="icon-container">
                  <img src="/icons/assignment-text.svg" />
                </div>
                <span>Copy Text</span>
              </Button>
            </Dropdown>
          )}
        </div>
        <div
          className="body"
          onMouseDown={(e) => {
            if (isNotLinkable) return;
            if (e.button === 1) {
              e.preventDefault();
              setTimeout(openPostInNewTab, 150);
            }
          }}
          onClick={(e) => {
            if (isNotLinkable) return;
            if (e.ctrlKey || e.metaKey) openPostInNewTab();
            else if (!props.displayData?.noLink?.includes(post.id)) openPost();
          }}
          onKeyDown={(e) => {
            if (isNotLinkable) return;
            if (
              e.key === "Enter" &&
              !props.displayData?.noLink?.includes(post.id)
            )
              openPost();
          }}
          tabIndex={0}
        >
          {post.body || (
            <span className="empty-body">This post has no text.</span>
          )}
        </div>

        {post.comic && <OnlineComic id={post.comic} />}
        {post.link && (
          <Link to={post.link} target="_blank" className="link">
            {post.link}
          </Link>
        )}
        {post.reference !== null &&
          ((post.type === "quote" && referenceStack.length <= 1) ||
            (post.type === "quote" &&
              props.displayData?.repost &&
              referenceStack.length <= 2)) && (
            <div className="quote">
              <OnlinePost
                postID={post.reference}
                displayData={{
                  ...props.displayData,
                  quote: true,
                  referenceStack,
                }}
              />
            </div>
          )}
        {!props.displayData?.quote && (
          <div className="interactions">
            <div>
              <LinkIconWithTooltip
                src={
                  liked
                    ? `/icons/heart-like-solid.svg`
                    : `/icons/heart-like.svg`
                }
                className="icon-container"
                tooltip="Like"
                onClick={async () => {
                  setLiked(!liked);
                  if (liked) {
                    const userID = session?.data.user?.id;
                    const postID = post.id;
                    updatePost((post) => post.likes--);
                    if (userID !== undefined)
                      await supabase
                        .from("posts_likes")
                        .delete({ count: "estimated" })
                        .eq("user", userID)
                        .eq("post", postID);
                  } else {
                    updatePost((post) => post.likes++);
                    await supabase.from("posts_likes").insert({
                      post: post.id,
                    });
                  }
                }}
              />
              <span>{post.likes}</span>
            </div>
            <div>
              <LinkIconWithTooltip
                src={`/icons/arrow-back.svg`}
                className="icon-container"
                tooltip="Reply"
                onClick={() => {
                  openPostDraft({ mode: "reply", reference: post.id });
                }}
              />
              <span>{post.replies}</span>
            </div>
            <div>
              <LinkIconWithTooltip
                src={`/icons/recycle.svg`}
                className="icon-container"
                tooltip="ReGarf"
                onClick={() => {
                  addAlert((clearAlert) => (
                    <Modal title="Confirm ReGarf">
                      <div>
                        <div>
                          Are you sure you would like to ReGarf this post?
                        </div>
                        <p />
                        <div>
                          <Button onClick={clearAlert}>No, Cancel</Button>{" "}
                          <Button
                            onClick={async () => {
                              await supabase.from("posts").insert({
                                type: "repost",
                                reference: post.id,
                              });
                            }}
                          >
                            Yes, ReGarf!
                          </Button>
                        </div>
                      </div>
                    </Modal>
                  ));
                }}
              />
            </div>
            <div>
              <LinkIconWithTooltip
                src={`/icons/user-cough.svg`}
                className="icon-container"
                tooltip="Quote"
                onClick={() =>
                  openPostDraft({ mode: "quote", reference: post.id })
                }
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function OnlinePost(props: {
  postID: number;
  displayData?: PostDisplayData;
}) {
  const [post, setPost] = useState<
    | null
    | {
        error: true;
        post: null;
      }
    | { error: false; post: Post }
  >(null);

  useEffect(() => {
    supabase
      .from("posts")
      .select()
      .eq("id", props.postID)
      .then((value) => {
        const data = value.data;
        if (data === null)
          setPost({
            error: true,
            post: null,
          });
        else
          setPost({
            error: false,
            post: data[0],
          });
      });
  }, []);

  if (post === null) {
    return (
      <div className="post-preview section loading">
        <l-dot-pulse color="white" />
      </div>
    );
  } else if (post.error) {
    return <div className="post-preview section error">An error occured.</div>;
  }

  return <PostPreview post={post.post} displayData={props.displayData} />;
}

function OnlineComic(props: { id: string }) {
  const [comic, setComic] = useState<Comic | undefined>(undefined);

  const addAlert = useAddAlert();

  useEffect(() => {
    const { data } = supabase.storage
      .from("default")
      .getPublicUrl(`comic_uploads/comic-${props.id}.garf`);

    fetch(data.publicUrl).then((response) => response.json().then(setComic));
  }, [props.id]);

  if (comic !== undefined)
    return (
      <div
        className="comic"
        onClick={() => {
          addAlert((clear) => (
            <div className="modal" onClick={clear}>
              <ComicViewer
                comic={comic}
                style={{
                  width: "calc(100vw - 2px)",
                  height: "calc(100vh - 2px)",
                  objectFit: "contain",
                  borderColor: "transparent"
                }}
              ></ComicViewer>
            </div>
          ));
        }}
        tabIndex={0}
        style={{
          cursor: "pointer"
        }}
      >
        <ComicViewer comic={comic} />
      </div>
    );
  else
    return (
      <div className={concatClasses("comic loading")}>
        <ComicViewer comic={DEFAULT_COMIC} />
        <l-dot-pulse color={"white"} />
      </div>
    );
}

export function SimplePost(props: {
  post: Post;
  author: { id: string | null; displayName: string };
}) {
  return (
    <div className="post-preview section">
      <div
        className={concatClasses(
          "icon-container profile-picture",
          props.author.id === null && "unknown-user"
        )}
      >
        {props.author.id === null ? (
          <span>?</span>
        ) : (
          <img
            src={`/sprites/custom/garfiedl/${
              simpleHash(props.author.id ?? "Unknown User") % 6
            }.svg`}
          />
        )}
      </div>

      <div className="post-content">
        <div className="information">
          <div className="author">
            <span>{props.author.displayName}</span>
          </div>
          <div>
            <span>{props.post.type}</span>
          </div>

          <div className="date">
            <ElementWithTooltip
              tooltip={formatDate(new Date(props.post.created_at), "very-long")}
            >
              <span>
                {formatDate(new Date(props.post.created_at), "short-adapt")}
              </span>
            </ElementWithTooltip>
          </div>
        </div>
        <div className="body">{props.post.body}</div>

        {props.post.comic && <OnlineComic id={props.post.comic} />}
        {/* {props.post.link && (
          <Link target="_blank" className="link">
            {props.post.link}
          </Link>
        )} */}
      </div>
    </div>
  );
}
