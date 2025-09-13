const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseServerError() {
    const userId = "af0a0786-1807-4513-9354-65fbf65b6c08";
    
    console.log("🔍 Diagnosing server error...");
    
    try {
        // 1. Check database connection
        console.log("\n1. Testing database connection...");
        const { data: testData, error: testError } = await supabase
            .from('wardrobe_items')
            .select('count')
            .limit(1);
            
        if (testError) {
            console.log("❌ Database connection failed:", testError.message);
            return;
        } else {
            console.log("✅ Database connection working");
        }
        
        // 2. Check if items exist
        console.log("\n2. Checking wardrobe items...");
        const { data: items, error: itemsError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', userId);
            
        if (itemsError) {
            console.log("❌ Error fetching items:", itemsError.message);
        } else {
            console.log(`✅ Found ${items?.length || 0} items`);
            if (items?.length > 0) {
                console.log("Recent items:");
                items.slice(0, 3).forEach(item => {
                    console.log(`  - ${item.name} (${item.color || 'No color'})`);
                });
            }
        }
        
        // 3. Test API endpoints
        console.log("\n3. Testing API endpoints...");
        
        const endpoints = [
            `http://localhost:3002/api/debug-wardrobe?userId=${userId}`,
            `http://localhost:3002/api/get-wardrobe-items?userId=${userId}`,
            `http://localhost:3002/api/test-auth`
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`Testing: ${endpoint}`);
                const response = await fetch(endpoint);
                console.log(`  Status: ${response.status} ${response.statusText}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`  Response: ${JSON.stringify(data).substring(0, 100)}...`);
                } else {
                    const errorText = await response.text();
                    console.log(`  Error: ${errorText.substring(0, 200)}...`);
                }
            } catch (apiError) {
                console.log(`  ❌ Failed to reach endpoint: ${apiError.message}`);
            }
        }
        
        // 4. Check if server is running
        console.log("\n4. Checking if development server is running...");
        try {
            const response = await fetch('http://localhost:3002');
            console.log(`✅ Server is running (Status: ${response.status})`);
        } catch (serverError) {
            console.log("❌ Server not running or not accessible");
            console.log("💡 Make sure to run: npm run dev");
        }
        
    } catch (error) {
        console.error("❌ Diagnosis failed:", error.message);
    }
}

diagnoseServerError();
