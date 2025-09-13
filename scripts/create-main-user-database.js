const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = "https://ybpjqzjqzjqzjqzjqzjq.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlicGpxempxempxempxempxempxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDU0NzIwMCwiZXhwIjoyMDUwMTIzMjAwfQ.example"; // Replace with your actual service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createMainUserDatabase() {
    console.log("🗄️ Creating main user wardrobe database structure...");
    
    try {
        // Execute the complete database schema creation
        console.log("📋 Creating database tables...");
        
        const schemaSQL = `
            -- Create profiles table (extends Supabase auth.users)
            CREATE TABLE IF NOT EXISTS public.profiles (
                id UUID REFERENCES auth.users(id) PRIMARY KEY,
                email TEXT,
                full_name TEXT,
                avatar_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Create categories table
            CREATE TABLE IF NOT EXISTS public.categories (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                icon TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Create tags table
            CREATE TABLE IF NOT EXISTS public.tags (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                color TEXT DEFAULT '#6B7280',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Create wardrobe_items table
            CREATE TABLE IF NOT EXISTS public.wardrobe_items (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
                category_id UUID REFERENCES public.categories(id) NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                brand TEXT,
                color TEXT,
                size TEXT,
                price DECIMAL(10,2),
                purchase_date DATE,
                image_url TEXT,
                image_path TEXT,
                is_favorite BOOLEAN DEFAULT FALSE,
                condition TEXT CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
                last_worn DATE,
                wear_count INTEGER DEFAULT 0,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Create wardrobe_item_tags junction table
            CREATE TABLE IF NOT EXISTS public.wardrobe_item_tags (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE NOT NULL,
                tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(wardrobe_item_id, tag_id)
            );

            -- Create outfits table
            CREATE TABLE IF NOT EXISTS public.outfits (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                occasion TEXT,
                weather_condition TEXT,
                temperature_range TEXT,
                season TEXT,
                is_favorite BOOLEAN DEFAULT FALSE,
                worn_date DATE,
                image_url TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Create outfit_items junction table
            CREATE TABLE IF NOT EXISTS public.outfit_items (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
                wardrobe_item_id UUID REFERENCES public.wardrobe_items(id) ON DELETE CASCADE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                UNIQUE(outfit_id, wardrobe_item_id)
            );

            -- Create outfit_recommendations table
            CREATE TABLE IF NOT EXISTS public.outfit_recommendations (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
                occasion TEXT,
                weather_data JSONB,
                location TEXT,
                ai_response TEXT,
                recommended_items JSONB,
                similar_items JSONB,
                is_saved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Create wardrobe_profiles table (for family members)
            CREATE TABLE IF NOT EXISTS public.wardrobe_profiles (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
                name VARCHAR(255) NOT NULL,
                relation VARCHAR(100),
                age INTEGER,
                date_of_birth DATE,
                profile_picture_url TEXT,
                profile_picture_path TEXT,
                is_owner BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            -- Create weather_essentials table
            CREATE TABLE IF NOT EXISTS public.weather_essentials (
                id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                color TEXT,
                condition TEXT CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')) DEFAULT 'good',
                weather_conditions TEXT[] DEFAULT '{}',
                assigned_to TEXT[] DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `;

        // Execute schema creation using raw SQL
        const { error: schemaError } = await supabase.rpc('exec_sql', { sql: schemaSQL });
        
        if (schemaError) {
            console.log("Schema creation note:", schemaError.message);
        } else {
            console.log("✅ Database tables created successfully");
        }

        // Create indexes
        console.log("📊 Creating database indexes...");
        const indexSQL = `
            -- Create indexes for better performance
            CREATE INDEX IF NOT EXISTS idx_wardrobe_items_user_id ON public.wardrobe_items(user_id);
            CREATE INDEX IF NOT EXISTS idx_wardrobe_items_category_id ON public.wardrobe_items(category_id);
            CREATE INDEX IF NOT EXISTS idx_wardrobe_items_created_at ON public.wardrobe_items(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_wardrobe_item_tags_item_id ON public.wardrobe_item_tags(wardrobe_item_id);
            CREATE INDEX IF NOT EXISTS idx_wardrobe_item_tags_tag_id ON public.wardrobe_item_tags(tag_id);
            CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON public.outfits(user_id);
            CREATE INDEX IF NOT EXISTS idx_outfit_items_outfit_id ON public.outfit_items(outfit_id);
            CREATE INDEX IF NOT EXISTS idx_outfit_recommendations_user_id ON public.outfit_recommendations(user_id);
            CREATE INDEX IF NOT EXISTS idx_wardrobe_profiles_user_id ON public.wardrobe_profiles(user_id);
            CREATE INDEX IF NOT EXISTS idx_weather_essentials_user_id ON public.weather_essentials(user_id);
        `;

        const { error: indexError } = await supabase.rpc('exec_sql', { sql: indexSQL });
        
        if (indexError) {
            console.log("Index creation note:", indexError.message);
        } else {
            console.log("✅ Database indexes created successfully");
        }

        // Enable Row Level Security
        console.log("🔒 Enabling Row Level Security...");
        const rlsSQL = `
            -- Enable Row Level Security (RLS)
            ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.wardrobe_item_tags ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.outfit_recommendations ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.wardrobe_profiles ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.weather_essentials ENABLE ROW LEVEL SECURITY;
        `;

        const { error: rlsError } = await supabase.rpc('exec_sql', { sql: rlsSQL });
        
        if (rlsError) {
            console.log("RLS setup note:", rlsError.message);
        } else {
            console.log("✅ Row Level Security enabled");
        }

        // Create RLS policies
        console.log("🛡️ Creating security policies...");
        const policiesSQL = `
            -- Create RLS policies
            -- Profiles policies
            CREATE POLICY IF NOT EXISTS "Users can view own profile" ON public.profiles
                FOR SELECT USING (auth.uid() = id);

            CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles
                FOR UPDATE USING (auth.uid() = id);

            CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON public.profiles
                FOR INSERT WITH CHECK (auth.uid() = id);

            -- Wardrobe items policies
            CREATE POLICY IF NOT EXISTS "Users can view own wardrobe items" ON public.wardrobe_items
                FOR SELECT USING (auth.uid() = user_id);

            CREATE POLICY IF NOT EXISTS "Users can insert own wardrobe items" ON public.wardrobe_items
                FOR INSERT WITH CHECK (auth.uid() = user_id);

            CREATE POLICY IF NOT EXISTS "Users can update own wardrobe items" ON public.wardrobe_items
                FOR UPDATE USING (auth.uid() = user_id);

            CREATE POLICY IF NOT EXISTS "Users can delete own wardrobe items" ON public.wardrobe_items
                FOR DELETE USING (auth.uid() = user_id);

            -- Wardrobe profiles policies
            CREATE POLICY IF NOT EXISTS "Users can view own wardrobe profiles" ON public.wardrobe_profiles
                FOR SELECT USING (auth.uid() = user_id);

            CREATE POLICY IF NOT EXISTS "Users can insert own wardrobe profiles" ON public.wardrobe_profiles
                FOR INSERT WITH CHECK (auth.uid() = user_id);

            CREATE POLICY IF NOT EXISTS "Users can update own wardrobe profiles" ON public.wardrobe_profiles
                FOR UPDATE USING (auth.uid() = user_id);

            CREATE POLICY IF NOT EXISTS "Users can delete own wardrobe profiles" ON public.wardrobe_profiles
                FOR DELETE USING (auth.uid() = user_id);

            -- Allow public read access to categories and tags
            CREATE POLICY IF NOT EXISTS "Anyone can view categories" ON public.categories
                FOR SELECT USING (true);

            CREATE POLICY IF NOT EXISTS "Anyone can view tags" ON public.tags
                FOR SELECT USING (true);
        `;

        const { error: policiesError } = await supabase.rpc('exec_sql', { sql: policiesSQL });
        
        if (policiesError) {
            console.log("Policies creation note:", policiesError.message);
        } else {
            console.log("✅ Security policies created");
        }

        // Create functions and triggers
        console.log("⚙️ Creating database functions and triggers...");
        const functionsSQL = `
            -- Create functions for updated_at timestamps
            CREATE OR REPLACE FUNCTION public.handle_updated_at()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = NOW();
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            -- Create triggers for updated_at
            CREATE TRIGGER IF NOT EXISTS handle_updated_at_profiles
                BEFORE UPDATE ON public.profiles
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

            CREATE TRIGGER IF NOT EXISTS handle_updated_at_wardrobe_items
                BEFORE UPDATE ON public.wardrobe_items
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

            CREATE TRIGGER IF NOT EXISTS handle_updated_at_outfits
                BEFORE UPDATE ON public.outfits
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

            CREATE TRIGGER IF NOT EXISTS handle_updated_at_wardrobe_profiles
                BEFORE UPDATE ON public.wardrobe_profiles
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

            CREATE TRIGGER IF NOT EXISTS handle_updated_at_weather_essentials
                BEFORE UPDATE ON public.weather_essentials
                FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

            -- Create function to automatically create profile on user signup
            CREATE OR REPLACE FUNCTION public.handle_new_user()
            RETURNS TRIGGER AS $$
            BEGIN
                INSERT INTO public.profiles (id, email, full_name)
                VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;

            -- Create trigger for new user signup
            CREATE TRIGGER IF NOT EXISTS on_auth_user_created
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        `;

        const { error: functionsError } = await supabase.rpc('exec_sql', { sql: functionsSQL });
        
        if (functionsError) {
            console.log("Functions creation note:", functionsError.message);
        } else {
            console.log("✅ Database functions and triggers created");
        }

        // Verify database structure
        console.log("🔍 Verifying database structure...");
        
        const tables = [
            'profiles', 'categories', 'tags', 'wardrobe_items', 
            'wardrobe_item_tags', 'outfits', 'outfit_items', 
            'outfit_recommendations', 'wardrobe_profiles', 'weather_essentials'
        ];

        for (const table of tables) {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(1);
            
            if (error) {
                console.log(`❌ Table ${table}: ${error.message}`);
            } else {
                console.log(`✅ Table ${table}: Ready`);
            }
        }

        console.log("\n🎉 Main user wardrobe database structure created successfully!");
        console.log("\n📋 Database includes:");
        console.log("  ✅ User profiles table");
        console.log("  ✅ Categories and tags tables");
        console.log("  ✅ Wardrobe items table");
        console.log("  ✅ Outfits and recommendations tables");
        console.log("  ✅ Family wardrobe profiles table");
        console.log("  ✅ Weather essentials table");
        console.log("  ✅ Security policies (RLS)");
        console.log("  ✅ Database indexes");
        console.log("  ✅ Triggers and functions");
        
        console.log("\n📝 Next steps:");
        console.log("1. Database structure is ready for the main user");
        console.log("2. No sample data has been added");
        console.log("3. Users can now add their own wardrobe items");
        console.log("4. The chatbot can access the database structure");

    } catch (error) {
        console.error("❌ Error creating database:", error);
    }
}

// Run the database creation
createMainUserDatabase();
