import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const mode: "production" | "development" = "production";

const supabase = (() => {
  // @ts-ignore
  if (mode === "production")
    return createClient<Database>(
      "https://kwonhehurdrlzjjuavri.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3b25oZWh1cmRybHpqanVhdnJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczNTI1MDMsImV4cCI6MjA3MjkyODUwM30.8G-99BU5jBcvalwaZhCNWTiEmqVycAGSYGFCoDby7do"
    );
  /*if (mode === "development")*/ else
    return createClient<Database>(
      "http://127.0.0.1:54321",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
    );
})();

export default supabase;
