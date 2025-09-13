const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addWorkingItem() {
    const userId = "af0a0786-1807-4513-9354-65fbf65b6c08";
    
    console.log("Adding a working wardrobe item...");
    
    try {
        // Add a simple, guaranteed-to-work item
        const item = {
            user_id: userId,
            name: "Blue Denim Jeans",
            description: "Comfortable blue jeans for everyday wear",
            color: "blue",
            category_id: "bottoms",
            condition: "good",
            wear_count: 0,
            is_favorite: false
        };
        
        const { data, error } = await supabase
            .from('wardrobe_items')
            .insert([item])
            .select()
            .single();
            
        if (error) {
            console.error("Error:", error.message);
            return;
        }
        
        console.log("SUCCESS! Item added:");
        console.log("- Name:", data.name);
        console.log("- Color:", data.color);
        console.log("- ID:", data.id);
        console.log("- User ID:", data.user_id);
        
        // Verify it's there
        const { data: items } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', userId);
            
        console.log(`\nTotal items in your wardrobe: ${items?.length || 0}`);
        
        console.log("\n🎉 DONE! Now refresh your chat page - it should work!");
        
    } catch (error) {
        console.error("Failed:", error.message);
    }
}

addWorkingItem();
