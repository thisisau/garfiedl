import { AuthError, Session, SupabaseClient } from "@supabase/supabase-js";
import supabase from "./client";
import { useEffect, useMemo, useState } from "react";

let cachedSession:
  | [typeof supabase.auth, Awaited<ReturnType<typeof supabase.auth.getUser>>]
  | null = null;

export function useSession(
  client: SupabaseClient<any, "public", any> = supabase
) {
  const [session, setSession] = useState<
    Awaited<ReturnType<typeof client.auth.getUser>> | undefined
  >();

  async function retrieveSession() {
    if (cachedSession === null || cachedSession[0] !== client.auth) {
      const session = await client.auth.getUser();
      cachedSession = [client.auth, session];
      console.log("Setting session cache");
    }
    setSession(cachedSession[1]);
    console.log("Retrieved session", cachedSession);
  }

  useEffect(() => {
    retrieveSession();
  }, [client.auth]);

  return session;
}

export function useIsLoggedIn(
  client: SupabaseClient<any, "public", any> = supabase
) {
  const session = useSession(client);

  const isLoggedIn = useMemo(() => {
    return session !== undefined && session.data.user !== null;
  }, [session]);

  return isLoggedIn;
}
