import { ReactElement, ReactNode } from "react";
import { isValidEmail, isValidPassword } from "../supabase/authentication";
import supabase from "../supabase/client";
import { SignOut } from "@supabase/supabase-js";

export const signup = async (
  loginInfo: React.MutableRefObject<{
    email: string;
    password: string;
    passwordConfirmation: string;
  }>,
  setLoginIncorrectContent: React.Dispatch<React.SetStateAction<ReactNode>>
) => {
  if (!isValidEmail(loginInfo.current.email)) {
    setLoginIncorrectContent(<span>Please enter a valid email.</span>);
    return;
  } else if (
    loginInfo.current.password !== loginInfo.current.passwordConfirmation
  ) {
    setLoginIncorrectContent(<span>Your passwords do not match.</span>);
    return;
  } else if (!isValidPassword(loginInfo.current.password)) {
    setLoginIncorrectContent(
      <>
        <span>Your password must be at least 8 characters long.</span>
      </>
    );
    return;
  } else {
    setLoginIncorrectContent(null);
  }

  const { data, error } = await supabase.auth.signUp({
    email: loginInfo.current.email,
    password: loginInfo.current.password,
  });

  if (error !== null) {
    if (error.status === 422 && error.name === "AuthApiError") {
      setLoginIncorrectContent(
        <span>User already exists! Try logging in instead.</span>
      );
    } else if (error.status === 429) {
      setLoginIncorrectContent(
        <span>Too many requests! Try again later.</span>
      );
      return;
    } else {
      setLoginIncorrectContent(
        <span>
          An {error.name} occured. (Code {error.code}, Message {error.message})
        </span>
      );
    }
  }

  return {data,error}
};

export const login = async (
  loginInfo: React.MutableRefObject<{
    email: string;
    password: string;
  }>,
  setLoginIncorrectContent: React.Dispatch<React.SetStateAction<ReactNode>>
) => {
  if (!isValidEmail(loginInfo.current.email)) {
    setLoginIncorrectContent(<span>Please enter a valid email.</span>);
    return;
  } else if (!isValidPassword(loginInfo.current.password)) {
    setLoginIncorrectContent(<span>Your email or password is incorrect.</span>);
    return;
  } else {
    setLoginIncorrectContent(null);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: loginInfo.current.email,
    password: loginInfo.current.password,
  });

  if (error !== null) {
    if (error.status === 429) {
      setLoginIncorrectContent(
        <span>Too many requests! Try again later.</span>
      );
      return;
    } else if (error.message === "Email not confirmed") {
      setLoginIncorrectContent(<span>Please check your inbox for a confirmation email.</span>)
    } else if (
      error.message === "Invalid login credentials"
    ) {
      setLoginIncorrectContent(
        <span>Your email or password is incorrect.</span>
      );
      return;
    } else {
      setLoginIncorrectContent(
        <span>
          An {error.name} occured. (Code {error.code}, Message {error.message})
        </span>
      );
    }
  } else {
    setTimeout(() => {
      window.location.href = `${window.location.protocol}//${
        window.location.host
      }/${decodeURIComponent(
        new URLSearchParams(window.location.search).get("redirect") || ""
      )}`;
    }, 500);
  }

  return {data,error}
};


export const logout = (options?: SignOut) => {
  supabase.auth.signOut(options);
}