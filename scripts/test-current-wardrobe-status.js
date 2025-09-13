const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with service role key
const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testCurrentWardrobeStatus() {
    console.log("🔍 Testing current wardrobe status...");
    
    try {
        const currentUserId = "af0a0786-1807-4513-9354-65fbf65b6c08"; // Current user from debug info
        const hardcodedUserId = "593c6f85-5e4e-47a4-b7a7-5d95ffdf782e"; // Hardcoded in API
        
        console.log(`\n👤 Current User ID: ${currentUserId}`);
        console.log(`🔧 Hardcoded API User ID: ${hardcodedUserId}`);
        
        // Check wardrobe items for current user
        console.log("\n📊 Checking wardrobe items for CURRENT user:");
        const { data: currentUserItems, error: currentError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', currentUserId);
            
        if (currentError) {
            console.error("❌ Error fetching current user items:", currentError.message);
        } else {
            console.log(`✅ Current user items: ${currentUserItems?.length || 0}`);
            if (currentUserItems?.length > 0) {
                currentUserItems.forEach(item => {
                    console.log(`  - ${item.name} (${item.color || 'No color'})`);
                });
            }
        }
        
        // Check wardrobe items for hardcoded user
        console.log("\n📊 Checking wardrobe items for HARDCODED API user:");
        const { data: hardcodedUserItems, error: hardcodedError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', hardcodedUserId);
            
        if (hardcodedError) {
            console.error("❌ Error fetching hardcoded user items:", hardcodedError.message);
        } else {
            console.log(`✅ Hardcoded user items: ${hardcodedUserItems?.length || 0}`);
            if (hardcodedUserItems?.length > 0) {
                hardcodedUserItems.forEach(item => {
                    console.log(`  - ${item.name} (${item.color || 'No color'})`);
                });
            }
        }
        
        // Check wardrobe profiles for current user
        console.log("\n👗 Checking wardrobe profiles for CURRENT user:");
        const { data: currentUserProfiles, error: profileError } = await supabase
            .from('wardrobe_profiles')
            .select('*')
            .eq('user_id', currentUserId);
            
        if (profileError) {
            console.error("❌ Error fetching profiles:", profileError.message);
        } else {
            console.log(`✅ Current user profiles: ${currentUserProfiles?.length || 0}`);
            if (currentUserProfiles?.length > 0) {
                currentUserProfiles.forEach(profile => {
                    console.log(`  - ${profile.name} (${profile.relation}) ${profile.is_owner ? '[OWNER]' : ''}`);
                });
            }
        }
        
        // Check if the current user exists in auth.users
        console.log("\n🔐 Checking user authentication:");
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
            console.error("❌ Error fetching users:", userError.message);
        } else {
            const currentUser = users.users.find(user => user.id === currentUserId);
            const hardcodedUser = users.users.find(user => user.id === hardcodedUserId);
            
            console.log(`Current user exists: ${currentUser ? '✅ Yes' : '❌ No'}`);
            if (currentUser) {
                console.log(`  Email: ${currentUser.email}`);
            }
            
            console.log(`Hardcoded user exists: ${hardcodedUser ? '✅ Yes' : '❌ No'}`);
            if (hardcodedUser) {
                console.log(`  Email: ${hardcodedUser.email}`);
            }
        }
        
        console.log("\n🔧 DIAGNOSIS:");
        if (currentUserItems?.length > 0) {
            console.log("✅ Current user HAS wardrobe items");
            console.log("❌ But API is looking at wrong user ID");
            console.log("🔧 SOLUTION: Update API to use current user ID");
        } else if (hardcodedUserItems?.length > 0) {
            console.log("❌ Current user has NO items");
            console.log("✅ Hardcoded user HAS items");
            console.log("🔧 SOLUTION: Either transfer items OR update user ID");
        } else {
            console.log("❌ Neither user has wardrobe items");
            console.log("🔧 SOLUTION: Add items to current user's wardrobe");
        }
        
    } catch (error) {
        console.error("❌ Error testing wardrobe status:", error);
    }
}

// Run the test
testCurrentWardrobeStatus();
