import MainHeader from "../components/header";
import NavPanel from "../components/nav_panel";
import PostViewer from "../components/post";
import PostCreator from "../components/post_creator";

export default function Home() {
  return (
    <div id="page-container">
      <MainHeader />
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
