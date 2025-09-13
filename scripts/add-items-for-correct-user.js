const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
// Use service role key to bypass RLS for data insertion
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.X45Nd50noVBzp8DcvNnnhEzdPG5NN6fzodA_Es9em94";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Use the CORRECT user ID that matches your API
const CORRECT_USER_ID = '593c6f85-5e4e-47a4-b7a7-5d95ffdf782e'; // indhusr.katlakanti@gmail.com

// Sample wardrobe items
const sampleWardrobeItems = [
  // Work/Professional
  { name: 'Black Blazer', category: 'outerwear', color: 'Black', size: 'M', brand: 'Zara', condition: 'excellent' },
  { name: 'White Button Shirt', category: 'tops', color: 'White', size: 'M', brand: 'Uniqlo', condition: 'good' },
  { name: 'Black Trousers', category: 'bottoms', color: 'Black', size: '30', brand: 'H&M', condition: 'good' },
  { name: 'Black Heels', category: 'shoes', color: 'Black', size: '8', brand: 'Cole Haan', condition: 'good' },
  
  // Casual
  { name: 'Blue Jeans', category: 'bottoms', color: 'Blue', size: '30', brand: 'Levi\'s', condition: 'good' },
  { name: 'White T-Shirt', category: 'tops', color: 'White', size: 'M', brand: 'Gap', condition: 'excellent' },
  { name: 'Red Sweater', category: 'tops', color: 'Red', size: 'M', brand: 'Zara', condition: 'good' },
  { name: 'White Sneakers', category: 'shoes', color: 'White', size: '8', brand: 'Adidas', condition: 'excellent' },
  
  // Evening/Formal
  { name: 'Black Dress', category: 'dresses', color: 'Black', size: 'M', brand: 'BCBG', condition: 'excellent' },
  { name: 'Red Cocktail Dress', category: 'dresses', color: 'Red', size: 'M', brand: 'Diane von Furstenberg', condition: 'excellent' },
  
  // Traditional
  { name: 'Blue Saree', category: 'dresses', color: 'Blue', size: 'One Size', brand: 'Fabindia', condition: 'excellent' },
  { name: 'Pink Kurta', category: 'tops', color: 'Pink', size: 'M', brand: 'Biba', condition: 'excellent' }
];

async function addItemsForCorrectUser() {
  console.log('🚀 Adding wardrobe items for the CORRECT user...');
  console.log(`👤 User ID: ${CORRECT_USER_ID}`);

  try {
    // Add wardrobe items
    console.log('👗 Adding wardrobe items...');
    for (const item of sampleWardrobeItems) {
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
            user_id: CORRECT_USER_ID,
            category_id: categoryData.id,
            name: item.name,
            brand: item.brand,
            color: item.color,
            size: item.size,
            condition: item.condition,
            image_url: `/images/placeholder.png`,
            is_favorite: Math.random() > 0.7,
            wear_count: Math.floor(Math.random() * 20),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.log(`⚠️  Error adding ${item.name}:`, error.message);
        } else {
          console.log(`✅ Added wardrobe item: ${item.name}`);
        }
      } else {
        console.log(`❌ Category not found for ${item.category}`);
      }
    }

    console.log('🎉 Data addition completed!');
    console.log(`✅ Added ${sampleWardrobeItems.length} wardrobe items for user: indhusr.katlakanti@gmail.com`);
    console.log('\n🔄 Now try your chatbot again - it should find your wardrobe items!');

  } catch (error) {
    console.error('❌ Error adding data:', error);
  }
}

// Run the script
addItemsForCorrectUser();
