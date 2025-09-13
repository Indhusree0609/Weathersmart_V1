const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Your user ID from the debug information
const YOUR_USER_ID = '5ba83a02-e6f6-4dc4-9bb7-6bb7d3b6f6b9';

// Categories mapping
const categories = {
  'tops': 'Tops',
  'bottoms': 'Bottoms',
  'dresses': 'Dresses',
  'shoes': 'Shoes',
  'outerwear': 'Outerwear',
  'accessories': 'Accessories',
  'traditional': 'Traditional Wear'
};

// Sample wardrobe items
const sampleWardrobeItems = [
  // Work/Professional
  { name: 'Black Blazer', category: 'outerwear', occasion: 'work', color: 'Black', size: 'M', brand: 'Zara', condition: 'excellent', description: 'Professional black blazer for office wear' },
  { name: 'White Button Shirt', category: 'tops', occasion: 'work', color: 'White', size: 'M', brand: 'Uniqlo', condition: 'good', description: 'Classic white button-down shirt' },
  { name: 'Black Trousers', category: 'bottoms', occasion: 'work', color: 'Black', size: '30', brand: 'H&M', condition: 'good', description: 'Formal black trousers' },
  { name: 'Black Heels', category: 'shoes', occasion: 'work', color: 'Black', size: '8', brand: 'Cole Haan', condition: 'good', description: 'Classic black pumps for office wear' },
  
  // Casual
  { name: 'Blue Jeans', category: 'bottoms', occasion: 'casual', color: 'Blue', size: '30', brand: 'Levi\'s', condition: 'good', description: 'Comfortable blue denim jeans' },
  { name: 'White T-Shirt', category: 'tops', occasion: 'casual', color: 'White', size: 'M', brand: 'Gap', condition: 'excellent', description: 'Basic white cotton t-shirt' },
  { name: 'Red Sweater', category: 'tops', occasion: 'casual', color: 'Red', size: 'M', brand: 'Zara', condition: 'good', description: 'Cozy red knit sweater' },
  { name: 'White Sneakers', category: 'shoes', occasion: 'casual', color: 'White', size: '8', brand: 'Adidas', condition: 'excellent', description: 'Clean white sneakers for casual outings' },
  
  // Evening/Formal
  { name: 'Black Dress', category: 'dresses', occasion: 'formal', color: 'Black', size: 'M', brand: 'BCBG', condition: 'excellent', description: 'Elegant black dress for formal events' },
  { name: 'Red Cocktail Dress', category: 'dresses', occasion: 'party', color: 'Red', size: 'M', brand: 'Diane von Furstenberg', condition: 'excellent', description: 'Stunning red dress for cocktail parties' },
  
  // Traditional
  { name: 'Blue Saree', category: 'traditional', occasion: 'cultural', color: 'Blue', size: 'One Size', brand: 'Fabindia', condition: 'excellent', description: 'Beautiful blue saree for cultural events' },
  { name: 'Pink Kurta', category: 'traditional', occasion: 'cultural', color: 'Pink', size: 'M', brand: 'Biba', condition: 'excellent', description: 'Traditional pink kurta for festivals' }
];

// Sample family profiles
const familyProfiles = [
  { name: 'My Wardrobe', relation: 'self', age: 25, date_of_birth: '1999-01-01', is_owner: true }
];

// Weather essentials
const weatherEssentials = [
  { name: 'Black Umbrella', category: 'rain_protection', weather_conditions: ['rainy', 'stormy'], color: 'Black', condition: 'excellent', assigned_to: ['everyone'] },
  { name: 'Winter Coat', category: 'cold_weather', weather_conditions: ['cold', 'snow'], color: 'Black', condition: 'excellent', assigned_to: ['everyone'] },
  { name: 'Sunglasses', category: 'sun_protection', weather_conditions: ['sunny', 'hot'], color: 'Black', condition: 'excellent', assigned_to: ['adults'] }
];

async function addDataForCurrentUser() {
  console.log('🚀 Adding wardrobe items for current user...');
  console.log(`👤 User ID: ${YOUR_USER_ID}`);

  try {
    // 1. Ensure categories exist
    console.log('📂 Ensuring categories exist...');
    for (const [key, name] of Object.entries(categories)) {
      const { data, error } = await supabase
        .from('categories')
        .upsert({
          name: key,
          description: name,
          created_at: new Date().toISOString()
        });
      
      if (error && !error.message.includes('duplicate')) {
        console.error(`❌ Error adding category ${name}:`, error);
      } else {
        console.log(`✅ Category ensured: ${name}`);
      }
    }

    // 2. Add family profiles
    console.log('👨‍👩‍👧‍👦 Adding family profiles...');
    for (const profile of familyProfiles) {
      const { data, error } = await supabase
        .from('wardrobe_profiles')
        .insert({
          user_id: YOUR_USER_ID,
          name: profile.name,
          relation: profile.relation,
          age: profile.age,
          date_of_birth: profile.date_of_birth,
          is_owner: profile.is_owner,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.log(`⚠️  Family profile might already exist for ${profile.name}:`, error.message);
      } else {
        console.log(`✅ Added family profile: ${profile.name}`);
      }
    }

    // 3. Add wardrobe items
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
            user_id: YOUR_USER_ID,
            category_id: categoryData.id,
            name: item.name,
            description: item.description,
            brand: item.brand,
            color: item.color,
            size: item.size,
            condition: item.condition,
            image_url: `/images/placeholder.png`,
            is_favorite: Math.random() > 0.7, // 30% chance of being favorite
            wear_count: Math.floor(Math.random() * 20),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        
        if (error) {
          console.log(`⚠️  Wardrobe item might already exist for ${item.name}:`, error.message);
        } else {
          console.log(`✅ Added wardrobe item: ${item.name}`);
        }
      } else {
        console.log(`❌ Category not found for ${item.category}`);
      }
    }

    // 4. Add weather essentials
    console.log('🌦️ Adding weather essentials...');
    for (const essential of weatherEssentials) {
      const { data, error } = await supabase
        .from('weather_essentials')
        .insert({
          user_id: YOUR_USER_ID,
          name: essential.name,
          category: essential.category,
          color: essential.color,
          condition: essential.condition,
          weather_conditions: essential.weather_conditions,
          assigned_to: essential.assigned_to,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.log(`⚠️  Weather essential might already exist for ${essential.name}:`, error.message);
      } else {
        console.log(`✅ Added weather essential: ${essential.name}`);
      }
    }

    console.log('🎉 Data addition completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Added ${Object.keys(categories).length} categories`);
    console.log(`- Added ${familyProfiles.length} family profile(s)`);
    console.log(`- Added ${sampleWardrobeItems.length} wardrobe items`);
    console.log(`- Added ${weatherEssentials.length} weather essentials`);
    
    console.log('\n🔄 Now try refreshing your chat and wardrobe pages!');

  } catch (error) {
    console.error('❌ Error adding data:', error);
  }
}

// Run the script
addDataForCurrentUser();
