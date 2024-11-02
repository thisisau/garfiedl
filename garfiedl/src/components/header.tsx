import { Link } from "react-router-dom";
import Button from "./button";
import supabase from "../supabase/client";
import { useSession } from "../supabase/hooks";
import { useAddAlert } from "./alerts/alert_hooks";
import { Modal } from "./modal";
export default function MainHeader() {
  const session = useSession();
  const addAlert = useAddAlert();

  return (
    <div id="header" className="section">
      <div>
        <h1>
          <a href="/" className="undecorated">
            GarfieDL.Com
          </a>
        </h1>
      </div>
      <div>
        {
          session === null || session.data.session === null ?
          <a
            href={
              window.location.pathname.length > 1
                ? `/login?redirect=${encodeURIComponent(
                    window.location.pathname.substring(1)
                  )}`
                : "/login"
            }
          >
            <Button onClick={() => {}}>Sign in</Button>
          </a>
          :
          <a
            href={"/account"}
          >
            <Button onClick={() => {}}>Account</Button>
          </a>
        }
        <Button
          onClick={async () => {
            // console.log(client);
            const session = await supabase.auth.getSession();
            console.log(session);
            addAlert(<Modal flexibleHeight title="Session"><p style={{maxWidth: "75%", wordWrap: "break-word"}}>{JSON.stringify(session)}</p></Modal>)
          }}
        >
          Account info
        </Button>
      </div>
    </div>
  );
}
