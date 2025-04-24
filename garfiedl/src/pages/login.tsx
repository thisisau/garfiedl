import { ReactElement, ReactNode, useEffect, useRef, useState } from "react";
import {
  Background,
  FlexSeparator,
  HorizontalLineSeparator,
} from "../components/separator";
import { TextInput } from "../components/input/input";
import Button from "../components/input/button";
import { login, signup } from "../functions/login_manager";
import { useAnimate } from "framer-motion";
import { entryAnimation, exitAnimation } from "../functions/animations";


export default function AccountManager() {
  const [mode, setMode] = useState<{
    screen: "login" | "signup";
    doEntryAnimation: boolean;
  }>({
    screen: window.location.pathname.toLowerCase().split("/")[1] as
      | "login"
      | "signup",
    doEntryAnimation: true,
  });

  const [scope, animate] = useAnimate();

  function Login() {
    useEffect(() => {
      if (mode.doEntryAnimation) entryAnimation(animate, ".login-container-content");
    }, []);

    return (
      <div className="login-container section">
        <div className="login-container-content">
          <div className="login-title">Log In</div>
          <HorizontalLineSeparator width={384} />
          <LoginForm />
          <div className="login-back">
            <a
              href={`${window.location.protocol}//${
                window.location.host
              }/${decodeURIComponent(
                new URLSearchParams(window.location.search).get("redirect") ||
                  ""
              )}`}
            >
              ↜ Back
            </a>
          </div>
        </div>
      </div>
    );
  }

  function SignUp() {
    useEffect(() => {
      if (mode.doEntryAnimation) entryAnimation(animate, ".login-container-content");
    }, []);
    return (
      <div className="login-container section">
        <div className="login-container-content">
          <div className="login-title">Sign Up</div>
          <HorizontalLineSeparator width={384} />
          <SignUpForm />
          <div className="login-back">
            <a
              href={`${window.location.protocol}//${
                window.location.host
              }/${decodeURIComponent(
                new URLSearchParams(window.location.search).get("redirect") ||
                  ""
              )}`}
            >
              ↜ Back
            </a>
          </div>
        </div>
      </div>
    );
  }

  function LoginForm() {
    const loginInfo = useRef({
      email: "",
      password: "",
    });

    const [loginIncorrectContent, setLoginIncorrectContent] =
      useState<ReactNode | null>(null);

    // const sendLogin = (e: React.FormEvent<HTMLFormElement>) => {
    //   e.preventDefault();
    //   login(loginInfo, setLoginIncorrectContent);
    // };

    return (
      <form className="login-form" onSubmit={e => e.preventDefault()}>
        <div>
          <TextInput
            placeholder="Email Address"
            textAlign="center"
            onUpdate={(val) => (loginInfo.current.email = val)}
            maxLength={254}
          />
          <TextInput
            placeholder="Password"
            textAlign="center"
            type="password"
            onUpdate={(val) => (loginInfo.current.password = val)}
            maxLength={128}
          />
          <Button
            onClick={() => login(loginInfo, setLoginIncorrectContent)}
            className={"login-submit-button"}
            id={"login-submit"}
            type="submit"
          >
            Log In
          </Button>
          <span className="login-incorrect-warning">
            {loginIncorrectContent}
          </span>
        </div>
        <div>
          <span className="login-form-text center-text">
            Don't have an account?&nbsp;
            <a
              href={`/signup${window.location.search}`}
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(
                  undefined,
                  "",
                  `/signup${window.location.search}`
                );
                exitAnimation(animate, ".login-container-content").then(() =>
                  setMode({ screen: "signup", doEntryAnimation: true })
                );
              }}
            >
              Sign up
            </a>
            !
          </span>
        </div>
      </form>
    );
  }

  function SignUpForm() {
    const loginInfo = useRef({
      email: "",
      password: "",
      passwordConfirmation: "",
    });

    const [loginIncorrectContent, setLoginIncorrectContent] =
      useState<ReactNode | null>(null);

    // const sendSignup = (e: React.FormEvent<HTMLFormElement>) => {
    //   e.preventDefault();
    //   signup(loginInfo, setLoginIncorrectContent);
    // };

    return (
      <form className="login-form"onSubmit={e => e.preventDefault()}>
        <div>
          <TextInput
            placeholder="Email Address"
            textAlign="center"
            onUpdate={(val) => (loginInfo.current.email = val)}
            maxLength={254}
            type="email"
          />
          <TextInput
            placeholder="Password"
            textAlign="center"
            type="password"
            onUpdate={(val) => (loginInfo.current.password = val)}
            maxLength={128}
          />
          <TextInput
            placeholder="Confirm Password"
            textAlign="center"
            type="password"
            onUpdate={(val) => (loginInfo.current.passwordConfirmation = val)}
            maxLength={128}
          />
          <Button
            type="submit"
            id="signup-submit"
            onClick={() => {
              console.log("Signing up ONE TIME with info", loginInfo)
              signup(loginInfo, setLoginIncorrectContent).then((data) => {
                if (data && data.error === null) {
                  const emailKey = crypto.randomUUID();
                  const searchParams = new URLSearchParams(window.location.search);
                  searchParams.set("emailKey", encodeURIComponent(emailKey));
                  localStorage.setItem(`auth-email-${emailKey}`, loginInfo.current.email)
                  window.location.href = "/signup/after?" + searchParams.toString()
                }
              })
            }}
            className={"login-submit-button"}
          >
            Sign Up
          </Button>
          <span className="login-incorrect-warning">
            {loginIncorrectContent}
          </span>
        </div>
        <div>
          <span className="login-form-text center-text">
            Already have an account?&nbsp;
            <a
              href={`/login${window.location.search}`}
              onClick={(e) => {
                e.preventDefault();
                window.history.pushState(
                  undefined,
                  "",
                  `/login${window.location.search}`
                );
                exitAnimation(animate, ".login-container-content").then(() =>
                  setMode({ screen: "login", doEntryAnimation: true })
                );
              }}
            >
              Log in
            </a>
            !
          </span>
        </div>
      </form>
    );
  }

  return (
    <>
      <div id="page-container" ref={scope}>
        <FlexSeparator />
        {mode.screen === "login" ? <Login /> : <SignUp />}
        <FlexSeparator />
      </div>
      <Background color="#121212" />
    </>
  );
}
