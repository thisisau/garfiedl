import {
  AnchorHTMLAttributes,
  HTMLAttributeAnchorTarget,
  MouseEventHandler,
  useEffect,
  useMemo,
  useRef,
} from "react";
import Button from "./input/button";
import { useOpenPostDraft } from "./post_creator";
import { Link } from "react-router-dom";
import { useIsLoggedIn, useSession } from "../supabase/hooks";

export default function NavPanel() {
  const isLoggedIn = useIsLoggedIn();
  const session = useSession();
  const openPostDraft = useOpenPostDraft();
  const panelRef = useRef<HTMLDivElement>(null);

  return (
    <div className="nav-panel" ref={panelRef}>
      <a className="home-link" href="/">
        garfiedl.com
      </a>
      <NavOption imageSrc="/icons/user-cough.svg" to={"/"}>
        Home
      </NavOption>
      {isLoggedIn ? (
        <>
          <NavOption
            imageSrc="/icons/send.svg"
            onClick={() => {
              openPostDraft({ mode: "post" });
            }}
          >
            Create Post
          </NavOption>
          <NavOption imageSrc="/icons/user-cough.svg" to={`/feed/following`}>
            Following
          </NavOption>
          <NavOption imageSrc="/icons/user-cough.svg" to={`/user/me`}>
            Profile
          </NavOption>
        </>
      ) : (
        <>
          <NavOption
            to={
              window.location.pathname.length > 1
                ? `/login?redirect=${encodeURIComponent(
                    window.location.pathname.substring(1)
                  )}`
                : "/login"
            }
            imageSrc="/icons/user-cough.svg"
          >
            Sign in
          </NavOption>
        </>
      )}
      <NavOption imageSrc="/icons/user-cough.svg" to={`/account`}>
        Settings
      </NavOption>
    </div>
  );
}

function NavOption(props: {
  to?: string;
  target?: HTMLAttributeAnchorTarget;
  imageSrc?: string;
  children: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      className="nav-option"
      to={props.to}
      target={props.target}
      onClick={props.onClick}
    >
      {props.imageSrc && (
        <div className="icon-container">
          <img src={props.imageSrc} />
        </div>
      )}
      <span className="label">{props.children}</span>
    </Link>
  );
}
