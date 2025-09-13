const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94"

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function fixDobColumn() {
  console.log("🚀 Fixing missing date_of_birth column in wardrobe_profiles table...")
  
  try {
    // Step 1: Check if date_of_birth column exists
    console.log("\n1️⃣ Checking if date_of_birth column exists...")
    
    const { data: columnCheck, error: columnError } = await supabase
      .from("wardrobe_profiles")
      .select("date_of_birth")
      .limit(1)
    
    if (!columnError) {
      console.log("✅ date_of_birth column already exists!")
      console.log("🎉 No migration needed.")
      return true
    }
    
    if (columnError.code !== "42703") {
      console.error("❌ Unexpected error checking column:", columnError)
      return false
    }
    
    console.log("📝 date_of_birth column does not exist, adding it now...")
    
    // Step 2: Add the date_of_birth column
    console.log("\n2️⃣ Adding date_of_birth column to wardrobe_profiles table...")
    
    const addColumnSQL = `
      -- Add date_of_birth column to wardrobe_profiles table
      ALTER TABLE wardrobe_profiles 
      ADD COLUMN date_of_birth DATE;
      
      -- Update existing profiles to have a calculated DOB based on current age
      UPDATE wardrobe_profiles 
      SET date_of_birth = CURRENT_DATE - INTERVAL '1 year' * COALESCE(age, 25)
      WHERE date_of_birth IS NULL AND age IS NOT NULL;
      
      -- Create index for better performance
      CREATE INDEX IF NOT EXISTS idx_wardrobe_profiles_dob ON wardrobe_profiles(date_of_birth);
    `
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseServiceKey}`,
        apikey: supabaseServiceKey,
      },
      body: JSON.stringify({
        sql: addColumnSQL,
      }),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ Failed to add date_of_birth column:", errorText)
      return false
    }
    
    console.log("✅ Successfully added date_of_birth column!")
    
    // Step 3: Verify the fix
    console.log("\n3️⃣ Verifying the fix...")
    
    const { data: verifyData, error: verifyError } = await supabase
      .from("wardrobe_profiles")
      .select("id, name, age, date_of_birth")
      .limit(3)
    
    if (verifyError) {
      console.error("❌ Verification failed:", verifyError)
      return false
    }
    
    console.log("✅ Verification successful!")
    console.log("📊 Sample profiles:", verifyData)
    
    console.log("\n🎉 date_of_birth column fix completed successfully!")
    console.log("🔄 Please refresh your app and try adding clothes again.")
    
    return true
    
  } catch (error) {
    console.error("❌ Fix failed:", error)
    return false
  }
}

// Run the fix
fixDobColumn().then(success => {
  if (success) {
    console.log("\n🎯 Next steps:")
    console.log("1. Refresh your app")
    console.log("2. Navigate to a child's wardrobe")
    console.log("3. Click 'Add New Item' - it should now work correctly!")
  } else {
    console.log("\n💡 Manual fix required:")
    console.log("1. Go to your Supabase dashboard")
    console.log("2. Open SQL Editor")
    console.log("3. Run: ALTER TABLE wardrobe_profiles ADD COLUMN date_of_birth DATE;")
  }
  process.exit(success ? 0 : 1)
})
