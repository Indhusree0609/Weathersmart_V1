const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// This should match the user ID from your current session
const USER_ID = 'af0a0786-1807-4513-9354-65fbf65b6c08';

const sampleItems = [
  // Dresses (since you asked about dresses)
  { name: 'Black Evening Dress', category: 'dresses', color: 'Black', size: 'M', brand: 'Zara' },
  { name: 'Red Cocktail Dress', category: 'dresses', color: 'Red', size: 'M', brand: 'H&M' },
  { name: 'Blue Summer Dress', category: 'dresses', color: 'Blue', size: 'M', brand: 'Forever 21' },
  { name: 'White Maxi Dress', category: 'dresses', color: 'White', size: 'M', brand: 'Zara' },
  { name: 'Floral Print Dress', category: 'dresses', color: 'Multicolor', size: 'M', brand: 'Anthropologie' },
  
  // Other items
  { name: 'White Button Shirt', category: 'tops', color: 'White', size: 'M', brand: 'Uniqlo' },
  { name: 'Blue Jeans', category: 'bottoms', color: 'Blue', size: '30', brand: 'Levi\'s' },
  { name: 'Black Blazer', category: 'outerwear', color: 'Black', size: 'M', brand: 'Zara' }
];

async function addWardrobeItems() {
  console.log('🚀 Adding wardrobe items...');
  console.log(`👤 User ID: ${USER_ID}`);

  try {
    // First, let's check if the user exists
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(USER_ID);
    if (authError || !authUser.user) {
      console.log('❌ User not found in auth system');
      return;
    }
    console.log(`✅ Found user: ${authUser.user.email}`);

    // Add items
    for (const item of sampleItems) {
      // Get category ID
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', item.category)
        .single();

      if (categoryData) {
        const { data, error } = await supabase
          .from('wardrobe_items')
          .insert({
            user_id: USER_ID,
            category_id: categoryData.id,
            name: item.name,
            brand: item.brand,
            color: item.color,
            size: item.size,
            condition: 'good',
            image_url: '/images/placeholder.png',
            is_favorite: false,
            wear_count: 0
          });
        
        if (error) {
          console.log(`❌ Error adding ${item.name}:`, error.message);
        } else {
          console.log(`✅ Added: ${item.name}`);
        }
      }
    }

    console.log('🎉 Done! Try asking about your dresses now.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addWardrobeItems();
