import { useEffect } from "react";
import MainHeader from "../components/header";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  useEffect(() => {
    if (
      window.location.pathname.split("/").filter((e) => e.length > 0)[0] ===
      "example-url"
    ) {
      window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    }
  }, [window.location]);

  const navigate = useNavigate()

  return (
    <div id="page-container" onClick={() => navigate(-1)}>
      <MainHeader />
      Page not found
    </div>
  );
}
