import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { count, error } = await supabase.from("analytics").select("*", { count: 'exact', head: true });
  if (error) {
    console.log("Error:", error.message);
    
    // Check if table exists by trying to create it if it fails with relation not found
    if (error.message.includes("relation \"analytics\" does not exist")) {
      console.log("TABLE DOES NOT EXIST. Suggesting creation...");
    }
  } else {
    console.log("Total Analytics Rows:", count);
    
    // Get some rows to see if they look like mock data
    const { data } = await supabase.from("analytics").select("*").limit(5);
    console.log("Recent rows:", JSON.stringify(data, null, 2));
  }
}
check();
