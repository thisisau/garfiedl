import { useEffect, useRef, useState } from "react";
import viteLogo from "/vite.svg";
import "./css/index.css";
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
            <Route path="/account" element={<Account />}></Route>
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
