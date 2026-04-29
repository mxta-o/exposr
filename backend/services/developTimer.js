const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function developPhotos() {
  const { data, error } = await supabase
    .from("photos")
    .update({ status: "ready" })
    .eq("status", "developing")
    .lte("reveal_at", new Date().toISOString())
    .select();

  if (error) {
    console.error("developTimer error:", error.message);
  } else if (data?.length > 0) {
    console.log(`Developed ${data.length} photo(s)`);
  }
}

// Run every 60 seconds
setInterval(developPhotos, 60 * 1000);
developPhotos(); // run once on startup

console.log("Develop timer running...");
