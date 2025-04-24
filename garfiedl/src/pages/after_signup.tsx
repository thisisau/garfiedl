import { useAnimate } from "framer-motion";
import {
  Background,
  FlexSeparator,
  HorizontalLineSeparator,
} from "../components/separator";
import {
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { entryAnimation, exitAnimation } from "../functions/animations";
import { TextInput } from "../components/input/input";
import Button from "../components/input/button";
import supabase from "../supabase/client";
import { useAddAlert, useAlertHandler } from "../components/alerts/alert_hooks";
import { Modal } from "../components/modal";
import { generateUsername } from "../functions/functions";
import { useStateObj } from "../functions/hooks";

export default function AfterSignup(props: {
  mode?: {
    screen: "verification" | "username"
  }
}) {
  const [scope, animate] = useAnimate();
  const [mode, setMode] = useState<{ screen: "verification" | "username" }>(props.mode || {
    screen: "verification",
  });

  const usernames = useRef(
    ["", "", "", "", ""].map(() => generateUsername(16))
  );
  const [info, setInfo] = useStateObj<{
    verificationCode: string;
    username: string;
  }>({
    verificationCode: "",
    username: "",
  });

  const addAlert = useAddAlert();
  const alertHandler = useAlertHandler();

  const email = useRef<string>(
    localStorage.getItem(
      `auth-email-${new URLSearchParams(window.location.search).get(
        "emailKey"
      )}`
    ) || ""
  );

  useEffect(() => {
    localStorage.removeItem(
      `auth-email-${new URLSearchParams(window.location.search).get(
        "emailKey"
      )}`
    );
    entryAnimation(animate, ".login-container-content");

    if (email.current === "") {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.delete("emailKey");
      const params = searchParams.toString();
      window.location.href = "/signup" + (params ? `?${params}` : "");
      return;
    }
  }, []);

  const [loginIncorrectContent, setLoginIncorrectContent] =
    useState<ReactNode | null>(null);
  /* 
  function Verify() {
    useEffect(() => entryAnimation(animate, ".login-container-content"), []);

    

    return (
      
      */
  const verify = (
    <div className="login-container section">
      <div className="login-container-content">
        <div className="login-title">Verify Email</div>
        <HorizontalLineSeparator width={384} />
        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          <div>
            <span className="center-text">
              Enter the six-digit verification code that was sent to{" "}
              {email.current}.
            </span>
            <TextInput
              maxLength={6}
              textAlign="center"
              placeholder="Verification Code"
              onUpdate={(val) => setInfo((e) => (e.verificationCode = val))}
              defaultValue={info.verificationCode}
            />
            <Button
              id="login-submit"
              type="submit"
              onClick={async () => {
                if (!/^\d{6}$/.test(info.verificationCode)) {
                  setLoginIncorrectContent(
                    <span>Please enter a six-digit number.</span>
                  );
                  return;
                }
                const { data, error } = await supabase.auth.verifyOtp({
                  email: email.current,
                  token: info.verificationCode,
                  type: "email",
                });
                if (error !== null) {
                  if (error.message === "Invalid email format")
                    setLoginIncorrectContent(
                      <span>Your email address is invalid.</span>
                    );
                  else if (error.code === "otp_expired")
                    setLoginIncorrectContent(
                      <span>Your token has expired or is incorrect.</span>
                    );
                  return;
                }
                exitAnimation(animate, ".login-container-content").then(() => {
                  setMode({ screen: "username" });

                  setTimeout(
                    () => entryAnimation(animate, ".login-container-content"),
                    0
                  );
                });
              }}
            >
              Verify Email
            </Button>
            <span className="login-incorrect-warning">
              {loginIncorrectContent}
            </span>
          </div>
          <div>
            <span className="login-form-text center-text">
              Didn't receive a code?&nbsp;
              <a
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  const alert = addAlert(
                    <Modal title="Verification">
                      Sending a code to {email.current}...
                    </Modal>
                  );
                  await supabase.auth.signInWithOtp({ email: email.current });
                  alertHandler.replaceAlert(
                    alert,
                    <Modal title="Verification">
                      A verification code has been sent to {email.current}!
                    </Modal>
                  );
                }}
              >
                Click here
              </a>
              &nbsp;to send another.
            </span>
          </div>
        </form>
        <div className="login-back">
          <a
            href={`${window.location.protocol}//${
              window.location.host
            }/${decodeURIComponent(
              new URLSearchParams(window.location.search).get("redirect") || ""
            )}`}
          >
            ↜ Exit
          </a>
        </div>
      </div>
    </div>
  );
  /* );
  }
*/
  /* function ChooseUsername() {
    useEffect(() => entryAnimation(animate, ".login-container-content"));

    return (*/

  const chooseUsername = (
    <div className="login-container section">
      <div className="login-container-content">
        <div className="login-title">Choose Username</div>
        <HorizontalLineSeparator width={384} />
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
                  .map((_, i) => localStorage.key(i))
                  .filter((e) => e?.startsWith("auth-email-"))
                  .filter((e) => e !== null);

                emailKeys.forEach((e) => localStorage.removeItem(e));

                if (info.username.length > 16) {
                  setLoginIncorrectContent(
                    <span>Your username is too long!</span>
                  );
                  return;
                }
                if (info.username.length < 3) {
                  setLoginIncorrectContent(
                    <span>
                      Your username must be at least three characters.
                    </span>
                  );
                  return;
                }
                if (info.username.match(/[^a-zA-Z0-9_-]/)) {
                  setLoginIncorrectContent(
                    <span>
                      Your username must only contain letters, numbers, hyphens,
                      and underscores.
                    </span>
                  );
                  return;
                }
                if (info.username.match(/^[-_]|[-_]$/)) {
                  setLoginIncorrectContent(
                    <span>
                      Your username can't start or end with a hyphen or
                      underscore.
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

                const user = await supabase.auth.getUser();

                if (user.error) {
                  setLoginIncorrectContent(
                    <span>An error occurred getting your user ID.</span>
                  );
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

                const redirect = decodeURIComponent(
                  new URLSearchParams(window.location.search).get("redirect") ??
                    ""
                );
                window.location.href = "/" + redirect;
              }}
            >
              Choose
            </Button>

            <span className="login-incorrect-warning">
              {loginIncorrectContent}
            </span>
          </div>
          <div>
            <fieldset className="username-picker">
              <legend className="center-text">Suggested Usernames</legend>
              <div>
                {usernames.current.map((username, i) => {
                  return (
                    <a
                      key={i}
                      href={"#"}
                      onClick={() => {
                        setInfo((e) => (e.username = username));
                      }}
                    >
                      {username}
                    </a>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </form>
        <div className="login-back">
          <a
            href={`${window.location.protocol}//${
              window.location.host
            }/${decodeURIComponent(
              new URLSearchParams(window.location.search).get("redirect") || ""
            )}`}
          >
            ↜ Exit
          </a>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <div id="page-container" ref={scope}>
        <FlexSeparator />
        {mode.screen === "verification" ? verify : chooseUsername}
        <FlexSeparator />
      </div>
      <Background color="#121212" />
    </>
  );
}
