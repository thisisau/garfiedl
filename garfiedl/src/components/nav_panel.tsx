import { HTMLAttributeAnchorTarget, MouseEventHandler, useRef } from "react";
import { useOpenPostDraft } from "./post_creator";
import { useIsLoggedIn } from "../supabase/hooks";
import { useScreenSize } from "../functions/hooks";
import { Dropdown } from "./input/dropdown";
import { Link } from "react-router-dom";
import { useAddAlert } from "./alerts/alert_hooks";
import { Modal } from "./modal";

function NavLinks() {
  const addAlert = useAddAlert();
  return (
    <div className="links">
      <div>
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
        <a
          href="."
          onClick={(e) => {
            e.preventDefault();
            addAlert(
              <Modal title="Contact">
                For inquiries and support, contact
                james.a&nbsp;[at]&nbsp;garfiedl&nbsp;[dot]&nbsp;com
              </Modal>
            );
          }}
        >
          Contact
        </a>
      </div>
      <div>
        <Link to="https://github.com/thisisau/garfiedl" target="_blank">Repository</Link>
      </div>
    </div>
  );
}

export default function NavPanel() {
  const isLoggedIn = useIsLoggedIn();
  const openPostDraft = useOpenPostDraft();
  const panelRef = useRef<HTMLDivElement>(null);
  const screenSize = useScreenSize();
  if (screenSize.width >= 990)
    return (
      <div className="nav-panel" ref={panelRef}>
        <Link className="home-link" to="/">
          garfiedl.com
        </Link>
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
            <NavOption imageSrc="/icons/heart-like.svg" to={`/feed/following`}>
              Following
            </NavOption>
            <NavOption imageSrc="/icons/user-single.svg" to={`/user/me`}>
              Profile
            </NavOption>
            <NavOption imageSrc="/icons/setting.svg" to={`/account`}>
              Settings
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
              imageSrc="/icons/user-add.svg"
            >
              Sign in
            </NavOption>
          </>
        )}
        <NavLinks />
      </div>
    );

  return (
    <div className="nav-panel" ref={panelRef}>
      <Link className="home-link" to="/">
        <img src="/favicon.ico" />
      </Link>
      <Dropdown
        containerClass="mobile-navigator"
        header={
          <div className="head icon-container section">
            <img src="/icons/menu-hamburger.svg" />
          </div>
        }
      >
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
            <NavOption imageSrc="/icons/heart-like.svg" to={`/feed/following`}>
              Following
            </NavOption>
            <NavOption imageSrc="/icons/user-single.svg" to={`/user/me`}>
              Profile
            </NavOption>
            <NavOption imageSrc="/icons/setting.svg" to={`/account`}>
              Settings
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
              imageSrc="/icons/user-add.svg"
            >
              Sign in
            </NavOption>
          </>
        )}
        <NavLinks />
      </Dropdown>
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
      to={props.to ?? "./"}
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
