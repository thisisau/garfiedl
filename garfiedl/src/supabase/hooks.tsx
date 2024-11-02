import { AuthError, Session, SupabaseClient } from "@supabase/supabase-js";
import supabase from "./client";
import { useEffect, useState } from "react";

export function useSession(
  client: SupabaseClient<any, "public", any> = supabase
) {
  const [session, setSession] = useState<
    | {
        data: {
          session: Session;
        };
        error: null;
      }
    | {
        data: {
          session: null;
        };
        error: AuthError;
      }
    | {
        data: {
          session: null;
        };
        error: null;
      }
      | null
  >(null);

  async function retrieveSession() {
    const session = await client.auth.getSession();
    setSession(session);
    console.log("Retrieved session", session);
  }

  useEffect(() => {
    retrieveSession();
  }, [client.auth]);

  return session;
}
