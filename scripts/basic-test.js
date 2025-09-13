console.log("=== BASIC TEST START ===");
console.log("Node.js version:", process.version);
console.log("Current directory:", process.cwd());

try {
    const { createClient } = require("@supabase/supabase-js");
    console.log("✅ Supabase client loaded successfully");
    
    const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
    const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("✅ Supabase client created");
    
    console.log("Testing database connection...");
    
    supabase
        .from('wardrobe_items')
        .select('count', { count: 'exact', head: true })
        .then(({ data, error, count }) => {
            if (error) {
                console.log("❌ Database Error:", error.message);
            } else {
                console.log("✅ Database connected! Total items:", count);
            }
        })
        .catch(err => {
            console.log("❌ Connection failed:", err.message);
        });
        
} catch (error) {
    console.log("❌ Script Error:", error.message);
}

console.log("=== BASIC TEST END ===");
