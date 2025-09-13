const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWardrobeTable() {
    console.log("=== CHECKING WARDROBE DATABASE ===");
    
    try {
        // 1. Check if wardrobe_items table exists by trying to query it
        console.log("1. Testing wardrobe_items table...");
        const { data, error } = await supabase
            .from('wardrobe_items')
            .select('*')
            .limit(1);
            
        if (error) {
            console.log("❌ ERROR:", error.message);
            if (error.message.includes("does not exist")) {
                console.log("❌ wardrobe_items table does NOT exist!");
            }
        } else {
            console.log("✅ wardrobe_items table EXISTS!");
            console.log(`   Sample data: ${data?.length || 0} items found`);
        }
        
        // 2. Check total count of items in table
        console.log("\n2. Checking total items in wardrobe_items...");
        const { count, error: countError } = await supabase
            .from('wardrobe_items')
            .select('*', { count: 'exact', head: true });
            
        if (countError) {
            console.log("❌ Count error:", countError.message);
        } else {
            console.log(`✅ Total items in wardrobe_items: ${count}`);
        }
        
        // 3. Check if there are any items at all
        console.log("\n3. Getting sample items...");
        const { data: sampleItems, error: sampleError } = await supabase
            .from('wardrobe_items')
            .select('id, name, user_id, created_at')
            .limit(5);
            
        if (sampleError) {
            console.log("❌ Sample error:", sampleError.message);
        } else {
            console.log(`✅ Sample items: ${sampleItems?.length || 0}`);
            if (sampleItems && sampleItems.length > 0) {
                sampleItems.forEach((item, i) => {
                    console.log(`   ${i+1}. ${item.name} (User: ${item.user_id}) - ${item.created_at}`);
                });
            }
        }
        
        // 4. Check table structure
        console.log("\n4. Checking table structure...");
        const { data: tableInfo, error: tableError } = await supabase
            .rpc('get_table_columns', { table_name: 'wardrobe_items' })
            .single();
            
        if (tableError) {
            console.log("❌ Table structure check failed:", tableError.message);
        } else {
            console.log("✅ Table structure available");
        }
        
        console.log("\n=== SUMMARY ===");
        console.log(`Table exists: ${error ? 'NO' : 'YES'}`);
        console.log(`Total items: ${count || 0}`);
        console.log(`Sample items: ${sampleItems?.length || 0}`);
        
    } catch (error) {
        console.error("❌ Script failed:", error.message);
    }
}

checkWardrobeTable();
