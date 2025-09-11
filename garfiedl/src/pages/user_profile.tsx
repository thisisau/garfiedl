import { useNavigate, useParams } from "react-router-dom";
import { LinkIconWithTooltip } from "../components/tooltip";
import { Fragment, ReactNode, useEffect, useState } from "react";
import supabase from "../supabase/client";
import type { UUID } from "crypto";
import MainHeader from "../components/header";
import { useStateObj } from "../functions/hooks";
import { concatClasses, plural, simpleHash } from "../functions/functions";
import { Post } from "../types/posts";
import { PostPreview } from "../components/post";
import Button from "../components/input/button";
import { InfiniteElementList } from "../components/list";
import { useSession } from "../supabase/hooks";
import NavPanel from "../components/nav_panel";

export default function UserProfile() {
  const navigate = useNavigate();
  const params = useParams();
  const session = useSession();

  const [profile, updateProfile] = useStateObj<{
    exists: boolean;
    id: UUID | null;
    displayName: string;
    interactions: null | {
      following: number;
      followers: number;
    };
  }>({
    exists: true,
    displayName: params.username ?? "",
    id: null,
    interactions: null,
  });

  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    if (profile.displayName === "me") {
      return;
    }

    supabase
      .rpc("get_user_info", { username: profile.displayName })
      .then((data) => {
        if (data.data === null) {
          updateProfile((profile) => (profile.exists = false));
        } else {
          updateProfile((profile) => {
            const response = data.data as {
              id: UUID;
              following_count: number;
              follower_count: number;
            };
            profile.id = response.id;
            profile.interactions = {
              followers: response.follower_count,
              following: response.following_count,
            };
          });
        }
      });
  }, [profile.displayName]);

  useEffect(() => {
    if (profile.id !== null)
      supabase
        .from("follows")
        .select("recipient")
        .eq("recipient", profile.id)
        .then((resp) => {
          if (resp.data && resp.data[0].recipient) {
            setFollowed(true);
          }
        });
  }, [profile.id]);

  useEffect(() => {
    const userID = session?.data.user?.id;
    console.log(session);
    if (userID && profile.displayName === "me")
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", userID)
        .then(({ data, error }) => {
          if (error) {
            navigate("/");
            return;
          }
          const displayName = data[0].display_name;
          if (displayName === null) {
            navigate("/");
            return;
          }
          navigate(`/user/${displayName}`, { replace: true });
          updateProfile((profile) => {
            profile.displayName = displayName;
            profile.id = userID as UUID;
            profile.exists = true;
          });
        });
    return;
  }, [session]);

  return (
    <div id="page-container">
      <div className="content">
        <div className="home-panels">
          <NavPanel />
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
              <span>{profile.displayName === "me" ? <l-dot-pulse color={"white"} /> : profile.displayName}</span>
              {session?.data.user?.id && profile.id && (
                <LinkIconWithTooltip
                  tooltip={followed ? "Following" : "Follow"}
                  className="icon-container"
                  onClick={async () => {
                    setFollowed(!followed);
                    if (followed) {
                      const userID = session?.data.user?.id;
                      updateProfile(
                        (profile) => profile.interactions!.followers--
                      );
                      if (userID !== undefined && profile.id)
                        await supabase
                          .from("follows")
                          .delete({ count: "estimated" })
                          .eq("creator", userID)
                          .eq("recipient", profile.id);
                    } else {
                      updateProfile(
                        (profile) => profile.interactions!.followers++
                      );
                      await supabase.from("follows").insert({
                        recipient: profile.id,
                        creator: session?.data.user?.id,
                      });
                    }
                  }}
                  src={
                    followed
                      ? "/icons/heart-like-solid.svg"
                      : "/icons/heart-like.svg"
                  }
                />
              )}
              <div className="icon-container profile-picture">
                {profile.id === null ? (
                  <span>?</span>
                ) : (
                  <img
                    src={`/sprites/custom/garfiedl/${
                      simpleHash(profile.id ?? "Unknown User") % 6
                    }.svg`}
                  />
                )}
              </div>
            </div>
            {profile.interactions && (
              <div className="interactions-panel">
                <div className="section">
                  {profile.interactions.followers}{" "}
                  {plural("follower", profile.interactions.followers)}
                </div>
                <div className="section">
                  {profile.interactions.following} following
                </div>
              </div>
            )}

            {profile.id ? (
              <UserPostList userID={profile.id} />
            ) : profile.exists ? (
              <l-dot-pulse color="white" />
            ) : (
              <div>This profile does not exist.</div>
            )}
            {/* <SinglePost key={params.postID} /> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function UserPostList(props: { userID: UUID }) {
  return (
    <div className="post-list">
      <InfiniteElementList
        itemsPerLoad={5}
        loadItems={async (start, count) => {
          const newPosts = await loadPosts(props.userID, start, count);
          return newPosts.map((post) => <PostPreview post={post} />);
        }}
      />
    </div>
  );
}

async function loadPosts(userID: UUID, start: number, count: number) {
  const filter = supabase
    .from("posts")
    .select()
    .neq("type", "reply")
    .eq("author", userID)
    .order("created_at", { ascending: false })
    .range(start, start + count - 1);
  const { data, error } = await filter;
  if (data === null) throw error;
  return data;
}
