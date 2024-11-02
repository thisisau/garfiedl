import { createClient } from "@supabase/supabase-js";

const mode: ("production" | "development") = "development"


const supabase = (() => { // @ts-ignore
  if (mode === "production") return createClient(
    "https://wpiiwklskjdchdbbnkhc.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwaWl3a2xza2pkY2hkYmJua2hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyOTU3NjUsImV4cCI6MjA0Mjg3MTc2NX0.Vu-uawX0FM06WnrFQDhcRpBefiix14-WVzcvmXaFNUY"
  );
  else /*if (mode === "development")*/ return createClient(
    "http://127.0.0.1:54321",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0"
  )
})()

export default supabase;
