import { AuthError, Session, SupabaseClient } from "@supabase/supabase-js";
import supabase from "./client";
import { useEffect, useState } from "react";

export function useSession(
  client: SupabaseClient<any, "public", any> = supabase
) {
  const [session, setSession] = useState<Awaited<ReturnType<typeof client.auth.getUser>> | undefined>();

  async function retrieveSession() {
    const session = await client.auth.getUser();
    setSession(session);
    console.log("Retrieved session", session);
  }

  useEffect(() => {
    retrieveSession();
  }, [client.auth]);

  return session;
}
