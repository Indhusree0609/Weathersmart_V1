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
    
    // Step 2: Add the date_of_birth column using SQL
    console.log("\n2️⃣ Adding date_of_birth column to wardrobe_profiles table...")
    
    // Use the sql method instead of rpc/exec
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE wardrobe_profiles ADD COLUMN date_of_birth DATE;'
    })
    
    if (error) {
      console.error("❌ Failed to add date_of_birth column:", error)
      console.log("\n💡 Let's try a different approach...")
      
      // Alternative: Try to insert a test record to trigger column creation
      console.log("🔄 Attempting alternative method...")
      
      // First, let's get existing profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("wardrobe_profiles")
        .select("*")
        .limit(1)
      
      if (profilesError) {
        console.error("❌ Could not fetch profiles:", profilesError)
        return false
      }
      
      console.log("✅ Successfully connected to wardrobe_profiles table")
      console.log("📊 Found profiles:", profiles?.length || 0)
      
      // Manual SQL execution needed
      console.log("\n💡 Manual fix required:")
      console.log("1. Go to your Supabase dashboard")
      console.log("2. Open SQL Editor")
      console.log("3. Run this SQL:")
      console.log("   ALTER TABLE wardrobe_profiles ADD COLUMN date_of_birth DATE;")
      console.log("4. Then run:")
      console.log("   UPDATE wardrobe_profiles SET date_of_birth = CURRENT_DATE - INTERVAL '1 year' * COALESCE(age, 25) WHERE date_of_birth IS NULL;")
      
      return false
    }
    
    console.log("✅ Successfully added date_of_birth column!")
    
    // Step 3: Update existing profiles
    console.log("\n3️⃣ Updating existing profiles with calculated DOB...")
    
    const { data: updateData, error: updateError } = await supabase.rpc('exec_sql', {
      sql: `UPDATE wardrobe_profiles 
            SET date_of_birth = CURRENT_DATE - INTERVAL '1 year' * COALESCE(age, 25)
            WHERE date_of_birth IS NULL AND age IS NOT NULL;`
    })
    
    if (updateError) {
      console.log("⚠️ Could not update existing profiles automatically, but column was added")
    } else {
      console.log("✅ Updated existing profiles with calculated DOB")
    }
    
    // Step 4: Verify the fix
    console.log("\n4️⃣ Verifying the fix...")
    
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
    console.log("🔄 Please refresh your app and try the chatbot again.")
    
    return true
    
  } catch (error) {
    console.error("❌ Fix failed:", error)
    console.log("\n💡 Manual fix required:")
    console.log("1. Go to your Supabase dashboard")
    console.log("2. Open SQL Editor") 
    console.log("3. Run: ALTER TABLE wardrobe_profiles ADD COLUMN date_of_birth DATE;")
    return false
  }
}

// Run the fix
fixDobColumn().then(success => {
  if (success) {
    console.log("\n🎯 Next steps:")
    console.log("1. Refresh your browser")
    console.log("2. Go to the chat page")
    console.log("3. Ask the chatbot about outfits - it should now show your wardrobe items!")
  }
  process.exit(success ? 0 : 1)
})
