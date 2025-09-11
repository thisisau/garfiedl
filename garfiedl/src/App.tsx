import { useEffect, useRef } from "react";
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
import AfterSignup from "./pages/after_signup";

import "./css/index.css";
import "./css/input.css";
import "./css/editor.css";
import "./css/post.css";
import "./css/home.css";

import { dotPulse } from "ldrs";
import SinglePost from "./components/post_viewer";
import UserProfile from "./pages/user_profile";
import Following from "./pages/following";
import { Privacy, Terms } from "./pages/legal";
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
            <Route path="/user/:username" element={<UserProfile />} />
            <Route path="/feed/following" element={<Following />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />}></Route>
          </Routes>
        </BrowserRouter>
        <GlobalElement />
      </AlertHandlerContext.Provider>
    </>
  );
}

export default App;
