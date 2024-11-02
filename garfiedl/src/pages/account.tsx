import Button from "../components/button";
import MainHeader from "../components/header";
import { logout } from "../functions/login_manager";
import supabase from "../supabase/client";
import { useSession } from "../supabase/hooks";

export default function Account() {
  const session = useSession();

  return (
    <div id="page-container">
      <MainHeader />
      I will make this page look good later
      <br />
      <div>
        <Button onClick={() => logout({ scope: "local" })}>Log Out</Button>
        <Button onClick={() => logout({ scope: "global" })}>
          Evil Log Out (log out of all accounts)
        </Button>
        <Button onClick={() => logout({ scope: "others" })}>
          Super Evil Log Out (log out of other accounts)
        </Button>
      </div>
      <div>
        <p>Account info(partially readable edition)</p>
        <p>Email: {session?.data.session?.user.email}</p>
      </div>
    </div>
  );
}
