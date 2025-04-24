import { useEffect, useRef, useState } from "react";
import viteLogo from "/vite.svg";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Login from "./pages/login";
import NotFound from "./pages/notfound";
import Account from "./pages/account";
import addListeners from "./functions/listeners";
import {
  AlertHandler,
  AlertHandlerContext,
} from "./components/alerts/alert_context";
import { GlobalElement } from "./components/alerts/global_element";
import TestStuff from "./pages/test_stuff";
import AfterSignup from "./pages/after_signup";

import "./css/index.css";
import "./css/input.css";
import "./css/editor.css";
import "./css/post.css";
import "./css/home.css";

import { dotPulse } from "ldrs";
import SinglePost from "./components/post_viewer";
dotPulse.register();

function App() {
  useEffect(addListeners, []);

  const alertHandler = useRef(new AlertHandler());

  return (
    <>
      <AlertHandlerContext.Provider value={alertHandler.current}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            {["/login", "/signup"].map((path, index) => (
              <Route path={path} element={<Login />} key={index} />
            ))}
            <Route path="/signup/after" element={<AfterSignup />}></Route>
            <Route path="/account" element={<Account />}></Route>
            <Route path="/post/:postID" element={<SinglePost />} />
            <Route path="*" element={<NotFound />}></Route>
            <Route path="/test-stuff" element={<TestStuff />}></Route>
          </Routes>
        </BrowserRouter>
        <GlobalElement />
      </AlertHandlerContext.Provider>
    </>
  );
}

export default App;
