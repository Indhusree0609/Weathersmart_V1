const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = "https://ybpjqzjqzjqzjqzjqzjq.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicGpxempxempxempxempxempxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU0NzIwMCwiZXhwIjoyMDUwMTIzMjAwfQ.example"; // Replace with your actual service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupMainUserWardrobe() {
    console.log("🚀 Setting up main user wardrobe database...");
    
    try {
        // 1. First, ensure the database schema exists
        console.log("📋 Creating database schema...");
        
        // Create profiles table if it doesn't exist
        const { error: profilesError } = await supabase.rpc('exec_sql', {
            sql: `
                CREATE TABLE IF NOT EXISTS public.profiles (
                    id UUID REFERENCES auth.users(id) PRIMARY KEY,
                    email TEXT,
                    full_name TEXT,
                    avatar_url TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            `
        });
        
        if (profilesError) {
            console.log("Profiles table might already exist or using direct table creation...");
        }

        // 2. Create categories table and insert default categories
        console.log("📂 Setting up categories...");
        const { error: categoriesError } = await supabase
            .from('categories')
            .upsert([
                { name: 'dresses', description: 'Dresses and gowns', icon: 'dress' },
                { name: 'tops', description: 'Shirts, blouses, and tops', icon: 'shirt' },
                { name: 'bottoms', description: 'Pants, jeans, and skirts', icon: 'pants' },
                { name: 'shoes', description: 'All types of footwear', icon: 'shoe' },
                { name: 'outerwear', description: 'Jackets, coats, and blazers', icon: 'jacket' },
                { name: 'accessories', description: 'Jewelry, bags, and accessories', icon: 'accessory' }
            ], { onConflict: 'name' });

        if (categoriesError) {
            console.log("Categories setup:", categoriesError.message);
        } else {
            console.log("✅ Categories created successfully");
        }

        // 3. Create tags and insert common tags
        console.log("🏷️ Setting up tags...");
        const { error: tagsError } = await supabase
            .from('tags')
            .upsert([
                { name: 'casual', color: '#10B981' },
                { name: 'formal', color: '#3B82F6' },
                { name: 'business', color: '#6366F1' },
                { name: 'party', color: '#EC4899' },
                { name: 'summer', color: '#F59E0B' },
                { name: 'winter', color: '#6B7280' },
                { name: 'spring', color: '#84CC16' },
                { name: 'fall', color: '#EA580C' },
                { name: 'black', color: '#1F2937' },
                { name: 'white', color: '#F9FAFB' },
                { name: 'red', color: '#EF4444' },
                { name: 'blue', color: '#3B82F6' },
                { name: 'green', color: '#10B981' },
                { name: 'cotton', color: '#84CC16' },
                { name: 'silk', color: '#EC4899' },
                { name: 'denim', color: '#3B82F6' }
            ], { onConflict: 'name' });

        if (tagsError) {
            console.log("Tags setup:", tagsError.message);
        } else {
            console.log("✅ Tags created successfully");
        }

        // 4. Find the main user (test@gmail.com)
        console.log("👤 Finding main user...");
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
            console.error("❌ Error fetching users:", userError.message);
            return;
        }

        const mainUser = users.users.find(user => user.email === 'test@gmail.com');
        
        if (!mainUser) {
            console.error("❌ Main user (test@gmail.com) not found!");
            return;
        }

        console.log(`✅ Found main user: ${mainUser.email} (ID: ${mainUser.id})`);

        // 5. Create or update the main user's profile
        console.log("📝 Setting up main user profile...");
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: mainUser.id,
                email: mainUser.email,
                full_name: 'Indhu'
            }, { onConflict: 'id' });

        if (profileError) {
            console.log("Profile setup:", profileError.message);
        } else {
            console.log("✅ Main user profile created/updated");
        }

        // 6. Create main user's wardrobe profile
        console.log("👗 Setting up main user wardrobe profile...");
        const { error: wardrobeProfileError } = await supabase
            .from('wardrobe_profiles')
            .upsert({
                user_id: mainUser.id,
                name: 'Indhu',
                relation: 'self',
                is_owner: true
            }, { onConflict: 'user_id,name' });

        if (wardrobeProfileError) {
            console.log("Wardrobe profile setup:", wardrobeProfileError.message);
        } else {
            console.log("✅ Main user wardrobe profile created");
        }

        // 7. Get category IDs for sample items
        const { data: categoriesData } = await supabase
            .from('categories')
            .select('id, name');

        const categoryMap = {};
        categoriesData?.forEach(cat => {
            categoryMap[cat.name] = cat.id;
        });

        // 8. Add some sample wardrobe items for the main user
        console.log("👕 Adding sample wardrobe items...");
        const sampleItems = [
            {
                user_id: mainUser.id,
                category_id: categoryMap['dresses'],
                name: 'Black Evening Dress',
                description: 'Elegant black dress for formal occasions',
                color: 'Black',
                brand: 'StyleGenie',
                condition: 'excellent',
                is_favorite: true
            },
            {
                user_id: mainUser.id,
                category_id: categoryMap['tops'],
                name: 'White Cotton Blouse',
                description: 'Comfortable white blouse for work',
                color: 'White',
                brand: 'StyleGenie',
                condition: 'good'
            },
            {
                user_id: mainUser.id,
                category_id: categoryMap['bottoms'],
                name: 'Blue Denim Jeans',
                description: 'Classic blue jeans for casual wear',
                color: 'Blue',
                brand: 'StyleGenie',
                condition: 'good'
            },
            {
                user_id: mainUser.id,
                category_id: categoryMap['shoes'],
                name: 'Black Heels',
                description: 'Professional black heels',
                color: 'Black',
                brand: 'StyleGenie',
                condition: 'excellent'
            }
        ];

        const { error: itemsError } = await supabase
            .from('wardrobe_items')
            .upsert(sampleItems, { onConflict: 'user_id,name' });

        if (itemsError) {
            console.log("Sample items setup:", itemsError.message);
        } else {
            console.log("✅ Sample wardrobe items added");
        }

        // 9. Verify the setup
        console.log("🔍 Verifying setup...");
        
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', mainUser.id)
            .single();

        const { data: wardrobeProfileData } = await supabase
            .from('wardrobe_profiles')
            .select('*')
            .eq('user_id', mainUser.id);

        const { data: itemsData } = await supabase
            .from('wardrobe_items')
            .select('*')
            .eq('user_id', mainUser.id);

        console.log("\n📊 Setup Summary:");
        console.log(`👤 User Profile: ${profileData ? '✅ Created' : '❌ Missing'}`);
        console.log(`👗 Wardrobe Profiles: ${wardrobeProfileData?.length || 0} found`);
        console.log(`👕 Wardrobe Items: ${itemsData?.length || 0} found`);

        if (wardrobeProfileData?.length > 0) {
            console.log("\n👗 Wardrobe Profiles:");
            wardrobeProfileData.forEach(profile => {
                console.log(`  - ${profile.name} (${profile.relation}) ${profile.is_owner ? '[OWNER]' : ''}`);
            });
        }

        if (itemsData?.length > 0) {
            console.log("\n👕 Sample Wardrobe Items:");
            itemsData.forEach(item => {
                console.log(`  - ${item.name} (${item.color})`);
            });
        }

        console.log("\n🎉 Main user wardrobe database setup completed successfully!");
        console.log("\n📝 Next steps:");
        console.log("1. The main user now has a complete wardrobe database structure");
        console.log("2. Sample items have been added for testing");
        console.log("3. The chatbot should now be able to access wardrobe data");
        console.log("4. You can add more items through the UI or additional scripts");

    } catch (error) {
        console.error("❌ Error setting up main user wardrobe:", error);
    }
}

// Run the setup
setupMainUserWardrobe();
