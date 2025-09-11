import NavPanel from "../components/nav_panel";

export default function NotFound() {
  if (
    window.location.pathname.split("/").filter((e) => e.length > 0)[0] ===
    "example-url"
  ) {
    window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
  }

  return (
    <div id="page-container">
      <div className="content">
        <div className="home-panels">
          <NavPanel />
          <div className="center-panel">
            <h1
              style={{
                textAlign: "center",
                margin: 0,
              }}
            >
              Error 404
            </h1>
            <p
              style={{
                textAlign: "center",
                margin: 0,
              }}
            >
              Page not found :(
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
