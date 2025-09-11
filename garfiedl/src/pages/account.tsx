import { ReactNode, useEffect, useState } from "react";
import Button from "../components/input/button";
import MainHeader from "../components/header";
import { useStateObj } from "../functions/hooks";
import { logout } from "../functions/login_manager";
import supabase from "../supabase/client";
import { useSession } from "../supabase/hooks";
import { useAddAlert } from "../components/alerts/alert_hooks";
import { Modal } from "../components/modal";
import { TextInput } from "../components/input/input";
import NavPanel from "../components/nav_panel";
import { FormItem, FormItemWithTitle } from "../components/form";
import { useNavigate } from "react-router-dom";

export default function Account() {
  const session = useSession();
  const addAlert = useAddAlert();

  const [info, setInfo] = useStateObj({ username: "…" });

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const profile = await supabase.from("profiles").select("display_name");
      console.log("Just fetched profile");
      if (profile.status === 200 && profile.data) {
        setInfo((e) => (e.username = profile.data[0].display_name ?? ""));
      }
    })();
  }, []);

  return (
    <div id="page-container">
      <div className="content">
        <div className="home-panels">
          <NavPanel />
          <div className="center-panel">
            <h1 style={{ textAlign: "center" }}>User Info</h1>
            <FormItem>Username: {info.username}</FormItem>
            <FormItem>
              Email: {session?.data?.user?.email ?? "Loading…"}
            </FormItem>
            <FormItemWithTitle title="Actions">
              <Button
                onClick={() =>
                  supabase.auth
                    .signOut({ scope: "local" })
                    .then(() => navigate("/"))
                }
              >
                Sign Out (this device)
              </Button>
              <Button
                onClick={() =>
                  supabase.auth
                    .signOut({ scope: "global" })
                    .then(() => navigate("/"))
                }
              >
                Sign Out (all devices)
              </Button>
              <Button
                onClick={() =>
                  addAlert(
                    <Modal title="Change Username" flexibleHeight>
                      <UsernameChangeDialog />
                    </Modal>
                  )
                }
              >
                Change Username
              </Button>
            </FormItemWithTitle>
          </div>
        </div>
      </div>
    </div>
  );
}

const UsernameChangeDialog = () => {
  const [info, setInfo] = useStateObj({ username: "" });
  const [loginIncorrectContent, setLoginIncorrectContent] =
    useState<ReactNode | null>(null);
  return (
    <form className="login-form" onSubmit={(e) => e.preventDefault()}>
      <div>
        <div className="username-editor">
          <span className="section text-input-component">@</span>
          <TextInput
            className="username-editor"
            maxLength={16}
            textAlign="center"
            placeholder="Add a username…"
            onUpdate={(val) => setInfo((e) => (e.username = val))}
            defaultValue={info.username}
          />
        </div>
        <Button
          type="submit"
          onClick={async () => {
            // Remove any extra auth email keys that might exist for some reason
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
              keys.push(localStorage.key(i));
            }
            const emailKeys = keys
              .map((e, i) => localStorage.key(i))
              .filter((e) => e?.startsWith("auth-email-"))
              .filter((e) => e !== null);

            emailKeys.forEach((e) => localStorage.removeItem(e));

            if (info.username.length > 16) {
              setLoginIncorrectContent(<span>Your username is too long!</span>);
              return;
            }
            if (info.username.length < 3) {
              setLoginIncorrectContent(
                <span>Your username must be at least three characters.</span>
              );
              return;
            }
            if (info.username.match(/[^a-zA-Z0-9_-]/)) {
              setLoginIncorrectContent(
                <span>
                  Your username must only contain letters, numbers, hyphens, and
                  underscores.
                </span>
              );
              return;
            }
            if (info.username.match(/^[-_]|[-_]$/)) {
              setLoginIncorrectContent(
                <span>
                  Your username can't start or end with a hyphen or underscore.
                </span>
              );
              return;
            }
            if (info.username.match(/[-_]{2}/)) {
              setLoginIncorrectContent(
                <span>
                  Your username can't contain consecutive hyphens or
                  underscores.
                </span>
              );
              return;
            }

            console.log("Chose username", info.username);

            const user = await supabase.auth.getUser();

            if (user.error) {
              setLoginIncorrectContent(
                <span>An error occurred getting your user ID.</span>
              );
              console.log("Error!", user);
              return;
            }

            const resp = await supabase.rpc("change_username", {
              user_id: user.data.user.id,
              new_username: info.username,
            });

            if (resp.status === 400) {
              setLoginIncorrectContent(<span>{resp.error?.message}</span>);
              return;
            }

            window.location.reload();
          }}
        >
          Choose
        </Button>

        <span className="login-incorrect-warning">{loginIncorrectContent}</span>
      </div>
    </form>
  );
};
