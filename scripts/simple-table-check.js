const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://ixqhqjqjqjqjqjqjqjqj.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4cWhxanFqcWpxanFqcWpxanFqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU5NzE5NCwiZXhwIjoyMDUxMTczMTk0fQ.example";

async function checkTable() {
    try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        console.log("=== WARDROBE TABLE CHECK ===");
        
        // Check if table exists by trying to query it
        const { data: tableCheck, error: tableError } = await supabase
            .from('wardrobe_items')
            .select('count', { count: 'exact', head: true });
            
        if (tableError) {
            console.log("❌ Table Error:", tableError.message);
            return;
        }
        
        console.log("✅ Table exists!");
        console.log("Total items in table:", tableCheck);
        
        // Check for your specific user
        const userId = "af0a0786-1807-4513-9354-65fbf65b6c08";
        const { data: userItems, error: userError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', userId);
            
        if (userError) {
            console.log("❌ User Query Error:", userError.message);
        } else {
            console.log(`Items for user ${userId}:`, userItems.length);
            if (userItems.length > 0) {
                console.log("Sample items:", userItems.slice(0, 3));
            }
        }
        
        // Check all items (first 5)
        const { data: allItems, error: allError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .limit(5);
            
        if (allError) {
            console.log("❌ All Items Error:", allError.message);
        } else {
            console.log("Sample of all items:", allItems);
        }
        
    } catch (error) {
        console.log("❌ Script Error:", error.message);
    }
}

checkTable();
