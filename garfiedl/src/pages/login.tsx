import { ReactElement, ReactNode, useRef, useState } from "react";
import MainHeader from "../components/header";
import {
  Background,
  FlexSeparator,
  HorizontalLineSeparator,
} from "../components/separator";
import { TextInput } from "../components/input";
import Button from "../components/button";
import { isValidEmail, isValidPassword } from "../supabase/authentication";
import supabase from "../supabase/client";
import { login, signup } from "../functions/login_manager";

export default function AccountManager() {
  const [mode, setMode] = useState<"login" | "signup">(
    window.location.pathname.toLowerCase().split("/")[1] as "login" | "signup"
  );

  function Login() {
    return (
      <div className="login-container section">
        <div className="login-title">Log In</div>
        <HorizontalLineSeparator width={384} />
        <LoginForm />
        <div className="login-back">
          <a
            href={`${window.location.protocol}//${
              window.location.host
            }/${decodeURIComponent(
              new URLSearchParams(window.location.search).get("redirect") || ""
            )}`}
          >
            ↜ Back
          </a>
        </div>
      </div>
    );
  }

  function SignUp() {
    return (
      <div className="login-container section">
        <div className="login-title">Sign Up</div>
        <HorizontalLineSeparator width={384} />
        <SignUpForm />
        <div className="login-back">
          <a
            href={`${window.location.protocol}//${
              window.location.host
            }/${decodeURIComponent(
              new URLSearchParams(window.location.search).get("redirect") || ""
            )}`}
          >
            ↜ Back
          </a>
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
      useState<ReactElement | null>(null);

    console.log(loginInfo);

    const sendLogin = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      login(loginInfo, setLoginIncorrectContent);
    }

    return (
      <form className="login-form" onSubmit={sendLogin}>
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
        <span className="login-incorrect-warning">{loginIncorrectContent}</span>
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
              setMode("signup");
            }}
          >
            Sign up
          </a>
          !
        </span>
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

    console.log(loginInfo);

    const sendSignup = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      signup(loginInfo, setLoginIncorrectContent);
    }

    return (
      <form className="login-form"  onSubmit={sendSignup}>
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
          onClick={() => signup(loginInfo, setLoginIncorrectContent)}
          className={"login-submit-button"}
        >
          Sign Up
        </Button>
        <span className="login-incorrect-warning">{loginIncorrectContent}</span>
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
              setMode("login");
            }}
          >
            Log In
          </a>
          !
        </span>
      </form>
    );
  }

  return (
    <>
      <div id="page-container">
        <FlexSeparator />
        {mode === "login" ? <Login /> : <SignUp />}
        <FlexSeparator />
      </div>
      <Background color="#121212" />
    </>
  );
}
