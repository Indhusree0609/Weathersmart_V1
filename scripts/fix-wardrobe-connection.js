const { createClient } = require("@supabase/supabase-js");

// Use the correct Supabase credentials from the main app
const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixWardrobeConnection() {
    console.log("🔧 Fixing wardrobe connection...");
    
    try {
        const currentUserId = "af0a0786-1807-4513-9354-65fbf65b6c08"; // Current user from debug
        
        console.log(`\n👤 Current User ID: ${currentUserId}`);
        
        // 1. Check if user exists in auth.users
        console.log("\n🔐 Checking user authentication...");
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
            console.error("❌ Error fetching users:", userError.message);
            return;
        }
        
        const currentUser = users.users.find(user => user.id === currentUserId);
        if (!currentUser) {
            console.error("❌ Current user not found in auth.users!");
            return;
        }
        
        console.log(`✅ User found: ${currentUser.email}`);
        
        // 2. Check/create profile
        console.log("\n📝 Checking user profile...");
        let { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUserId)
            .single();
            
        if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create it
            console.log("📝 Creating user profile...");
            const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                    id: currentUserId,
                    email: currentUser.email,
                    full_name: 'Indhu'
                })
                .select()
                .single();
                
            if (createError) {
                console.error("❌ Error creating profile:", createError.message);
                return;
            }
            
            profile = newProfile;
            console.log("✅ Profile created successfully");
        } else if (profileError) {
            console.error("❌ Error fetching profile:", profileError.message);
            return;
        } else {
            console.log("✅ Profile exists");
        }
        
        // 3. Check wardrobe items for current user
        console.log("\n👕 Checking wardrobe items...");
        const { data: items, error: itemsError } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', currentUserId);
            
        if (itemsError) {
            console.error("❌ Error fetching wardrobe items:", itemsError.message);
            return;
        }
        
        console.log(`📊 Found ${items?.length || 0} wardrobe items for current user`);
        
        if (items?.length > 0) {
            console.log("✅ Items found:");
            items.forEach(item => {
                console.log(`  - ${item.name} (${item.color || 'No color'})`);
            });
        }
        
        // 4. Check if items exist for other users (maybe added to wrong user)
        console.log("\n🔍 Checking for items added to other users...");
        const { data: allItems, error: allItemsError } = await supabase
            .from('wardrobe_items')
            .select('user_id, name, color, created_at')
            .order('created_at', { ascending: false })
            .limit(10);
            
        if (allItemsError) {
            console.error("❌ Error fetching all items:", allItemsError.message);
        } else {
            console.log(`📊 Recent items in database (last 10):`);
            allItems?.forEach(item => {
                const isCurrentUser = item.user_id === currentUserId;
                console.log(`  - ${item.name} (${item.color || 'No color'}) - User: ${item.user_id} ${isCurrentUser ? '👤 [YOU]' : ''}`);
            });
        }
        
        // 5. Add a test item to verify everything works
        if (items?.length === 0) {
            console.log("\n➕ Adding a test item to verify connection...");
            const testItem = {
                user_id: currentUserId,
                name: "Test Blue Jeans",
                description: "Test item to verify wardrobe connection",
                color: "blue",
                category_id: "bottoms",
                condition: "good",
                wear_count: 0,
                is_favorite: false
            };
            
            const { data: newItem, error: addError } = await supabase
                .from('wardrobe_items')
                .insert([testItem])
                .select()
                .single();
                
            if (addError) {
                console.error("❌ Error adding test item:", addError.message);
            } else {
                console.log("✅ Test item added successfully!");
                console.log(`  - ${newItem.name} (ID: ${newItem.id})`);
            }
        }
        
        // 6. Check wardrobe profiles
        console.log("\n👗 Checking wardrobe profiles...");
        let { data: wardrobeProfiles, error: profilesError } = await supabase
            .from('wardrobe_profiles')
            .select('*')
            .eq('user_id', currentUserId);
            
        if (profilesError) {
            console.error("❌ Error fetching wardrobe profiles:", profilesError.message);
        } else {
            console.log(`📊 Found ${wardrobeProfiles?.length || 0} wardrobe profiles`);
            
            if (!wardrobeProfiles?.length) {
                // Create main wardrobe profile
                console.log("👗 Creating main wardrobe profile...");
                const { data: newWardrobeProfile, error: createProfileError } = await supabase
                    .from('wardrobe_profiles')
                    .insert({
                        user_id: currentUserId,
                        name: 'Indhu',
                        relation: 'self',
                        is_owner: true
                    })
                    .select()
                    .single();
                    
                if (createProfileError) {
                    console.error("❌ Error creating wardrobe profile:", createProfileError.message);
                } else {
                    console.log("✅ Main wardrobe profile created");
                    wardrobeProfiles = [newWardrobeProfile];
                }
            }
        }
        
        console.log("\n🎯 SUMMARY:");
        console.log(`👤 User Profile: ${profile ? '✅ Ready' : '❌ Missing'}`);
        console.log(`👗 Wardrobe Profile: ${wardrobeProfiles?.length > 0 ? '✅ Ready' : '❌ Missing'}`);
        console.log(`👕 Wardrobe Items: ${items?.length || 0} found`);
        
        if (items?.length === 0) {
            console.log("\n🔧 NEXT STEPS:");
            console.log("1. The database structure is ready");
            console.log("2. Try adding an item through the UI again");
            console.log("3. Check browser console for any errors");
            console.log("4. If issues persist, the test item above should work for testing");
        } else {
            console.log("\n✅ Everything looks good! The chatbot should work now.");
            console.log("Try refreshing your chat page - it should show wardrobe data!");
        }
        
    } catch (error) {
        console.error("❌ Error fixing wardrobe connection:", error);
    }
}

// Run the fix
fixWardrobeConnection();
