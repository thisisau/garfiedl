import supabase from "../supabase/client";

export default function addListeners() {
  supabase.auth.onAuthStateChange((event) => {
    console.log("Auth Event!!", event);

    if (event === "SIGNED_OUT") window.location.reload();
  });
}
