import NavPanel from "../components/nav_panel";
import PostViewer from "../components/post";

export default function Home() {
  return (
    <div id="page-container">
      <div className="content">
        <div className="home-panels">
          <NavPanel />
          <div className="center-panel">
            <PostViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
