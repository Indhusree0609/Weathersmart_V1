const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWardrobe() {
    const userId = "af0a0786-1807-4513-9354-65fbf65b6c08";
    
    console.log("Checking wardrobe for user:", userId);
    
    // Check wardrobe items
    const { data: items, error } = await supabase
        .from('wardrobe_items')
        .select('*')
        .eq('user_id', userId);
    
    if (error) {
        console.log("Error:", error.message);
    } else {
        console.log("Items found:", items?.length || 0);
        if (items?.length > 0) {
            items.forEach(item => console.log("-", item.name, item.color));
        }
    }
    
    // Check all recent items
    const { data: allItems } = await supabase
        .from('wardrobe_items')
        .select('user_id, name, color')
        .order('created_at', { ascending: false })
        .limit(5);
    
    console.log("Recent items in DB:");
    allItems?.forEach(item => {
        console.log("-", item.name, "User:", item.user_id.substring(0, 8) + "...");
    });
}

checkWardrobe().catch(console.error);
