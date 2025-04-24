import MainHeader from "../components/header";
import PostViewer from "../components/post";
import PostCreator from "../components/post_creator";

export default function Home() {
  return (
    <div id="page-container">
      <MainHeader />
      <div className="content">
        <div className="home-panels">
          <div className="center-panel">
            <PostCreator />
            <hr className="gray" />
            <PostViewer />
          </div>
        </div>
      </div>
    </div>
  );
}
