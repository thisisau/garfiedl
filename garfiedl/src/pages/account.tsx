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

export default function Account() {
  const session = useSession();
  const addAlert = useAddAlert();

  const [info, setInfo] = useStateObj({ username: "" });

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
      <MainHeader />
      I will make this page look good later
      <br />
      <div>
        <Button onClick={() => logout({ scope: "local" })}>Log Out</Button>
        <Button onClick={() => logout({ scope: "global" })}>
          Evil Log Out (log out of all accounts)
        </Button>
        <Button onClick={() => logout({ scope: "others" })}>
          Super Evil Log Out (log out of other accounts)
        </Button>
      </div>
      <div>
        <Button
          onClick={() =>
            addAlert(<Modal title="Change Username" flexibleHeight>
                <UsernameChangeDialog />
              </Modal>
            )
          }
        >
          Change Username
        </Button>
      </div>
      <div>
        <p>Account info(partially readable edition)</p>
        <p>Email: {session?.data.user?.email}</p>
        <p>Username: {info.username}</p>
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
            placeholder="Add a username..."
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
