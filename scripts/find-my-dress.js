const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findDress() {
    const userId = "af0a0786-1807-4513-9354-65fbf65b6c08";
    
    console.log("🔍 SEARCHING FOR YOUR DRESS...");
    console.log("User ID:", userId);
    console.log("==================================================");
    
    try {
        // 1. Check ALL items for this user
        console.log("\n1. Checking ALL items for your user ID:");
        const { data: userItems, error: userError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', userId);
            
        if (userError) {
            console.error("Error fetching user items:", userError);
        } else {
            console.log(`Found ${userItems?.length || 0} items for your user ID`);
            if (userItems && userItems.length > 0) {
                userItems.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.name} (${item.category_id || 'no category'}) - ID: ${item.id}`);
                });
            }
        }
        
        // 2. Search for any dress-like items
        console.log("\n2. Searching for dress-like items (any user):");
        const { data: dressItems, error: dressError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .or('name.ilike.%dress%,category_id.ilike.%dress%,description.ilike.%dress%');
            
        if (dressError) {
            console.error("Error searching for dresses:", dressError);
        } else {
            console.log(`Found ${dressItems?.length || 0} dress-like items in database`);
            if (dressItems && dressItems.length > 0) {
                dressItems.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.name} - User: ${item.user_id} - ID: ${item.id}`);
                    if (item.user_id === userId) {
                        console.log("    ⭐ THIS IS YOUR DRESS!");
                    }
                });
            }
        }
        
        // 3. Check recent items (last 10)
        console.log("\n3. Checking 10 most recent items in database:");
        const { data: recentItems, error: recentError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (recentError) {
            console.error("Error fetching recent items:", recentError);
        } else {
            console.log(`Found ${recentItems?.length || 0} recent items`);
            if (recentItems && recentItems.length > 0) {
                recentItems.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.name} - User: ${item.user_id} - Created: ${item.created_at}`);
                    if (item.user_id === userId) {
                        console.log("    ⭐ THIS IS YOURS!");
                    }
                });
            }
        }
        
        // 4. Test the exact same query the chat API uses
        console.log("\n4. Testing EXACT chat API query:");
        const { data: chatQuery, error: chatError } = await supabase
            .from("wardrobe_items")
            .select("*")
            .eq("user_id", userId)
            .limit(50);
            
        if (chatError) {
            console.error("Chat API query error:", chatError);
        } else {
            console.log(`Chat API would find: ${chatQuery?.length || 0} items`);
            if (chatQuery && chatQuery.length > 0) {
                chatQuery.forEach((item, index) => {
                    console.log(`  ${index + 1}. ${item.name} (${item.category_id || 'no category'})`);
                });
            }
        }
        
        console.log("\n==================================================");
        console.log("SUMMARY:");
        console.log(`- Items for your user ID: ${userItems?.length || 0}`);
        console.log(`- Dress-like items in database: ${dressItems?.length || 0}`);
        console.log(`- Items chat API would find: ${chatQuery?.length || 0}`);
        
        if ((userItems?.length || 0) === 0) {
            console.log("\n❌ PROBLEM: No items found for your user ID!");
            console.log("This means either:");
            console.log("1. The dress was saved with a different user ID");
            console.log("2. The dress wasn't saved successfully");
            console.log("3. The dress is in a different table");
        } else {
            console.log("\n✅ Items found! The chat should be working.");
        }
        
    } catch (error) {
        console.error("Script failed:", error);
    }
}

findDress();
