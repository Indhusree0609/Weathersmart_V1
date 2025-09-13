const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

// Sarah's wardrobe items
const sarahWardrobeItems = [
  // Work/Professional
  { name: 'Black Sheath Dress', category: 'dresses', image: 'black-sheath-dress.png', occasion: 'work', color: 'Black', size: 'M', brand: 'Ann Taylor', condition: 'excellent', description: 'Professional black sheath dress perfect for meetings' },
  { name: 'Cream Business Suit', category: 'outerwear', image: 'cream-business-suit.png', occasion: 'work', color: 'Cream', size: 'M', brand: 'Hugo Boss', condition: 'excellent', description: 'Elegant cream blazer for professional settings' },
  { name: 'Black Heels', category: 'shoes', image: 'black-shoes.png', occasion: 'work', color: 'Black', size: '8', brand: 'Cole Haan', condition: 'good', description: 'Classic black pumps for office wear' },
  
  // Casual
  { name: 'White Summer Top', category: 'tops', image: 'white-summer-top.png', occasion: 'casual', color: 'White', size: 'M', brand: 'Zara', condition: 'good', description: 'Lightweight white blouse for summer' },
  { name: 'Blue Summer Jeans', category: 'bottoms', image: 'blue-summer-jeans.png', occasion: 'casual', color: 'Blue', size: '30', brand: 'Levi\'s', condition: 'good', description: 'Comfortable blue denim jeans' },
  { name: 'White Sneakers', category: 'shoes', image: 'white-shoes.png', occasion: 'casual', color: 'White', size: '8', brand: 'Adidas', condition: 'excellent', description: 'Clean white sneakers for casual outings' },
  
  // Evening/Formal
  { name: 'Black Evening Gown', category: 'dresses', image: 'black-evening-gown.png', occasion: 'formal', color: 'Black', size: 'M', brand: 'BCBG', condition: 'excellent', description: 'Elegant black gown for formal events' },
  { name: 'Red Cocktail Dress', category: 'dresses', image: 'red-cocktail-dress.png', occasion: 'party', color: 'Red', size: 'M', brand: 'Diane von Furstenberg', condition: 'excellent', description: 'Stunning red dress for cocktail parties' },
  
  // Traditional
  { name: 'Orange Saree', category: 'traditional', image: 'orange-saree.png', occasion: 'cultural', color: 'Orange', size: 'One Size', brand: 'Fabindia', condition: 'excellent', description: 'Beautiful orange saree for cultural events' }
];

// Sarah's family profiles
const sarahFamilyProfiles = [
  { name: 'David Johnson', relation: 'husband', age: 30, date_of_birth: '1994-03-15', is_owner: false },
  { name: 'Lily Johnson', relation: 'daughter', age: 5, date_of_birth: '2019-08-22', is_owner: false }
];

// Weather essentials
const weatherEssentials = [
  // Rain protection
  { name: 'Black Umbrella', category: 'rain_protection', weather_conditions: ['rainy', 'stormy'], color: 'Black', condition: 'excellent', assigned_to: ['everyone'] },
  { name: 'Rain Boots', category: 'rain_protection', weather_conditions: ['rainy', 'stormy'], color: 'Black', condition: 'good', assigned_to: ['adults'] },
  { name: 'Waterproof Jacket', category: 'rain_protection', weather_conditions: ['rainy', 'stormy'], color: 'Navy', condition: 'excellent', assigned_to: ['everyone'] },
  
  // Cold weather
  { name: 'Winter Coat', category: 'cold_weather', weather_conditions: ['cold', 'snow'], color: 'Black', condition: 'excellent', assigned_to: ['everyone'] },
  { name: 'Wool Scarf', category: 'cold_weather', weather_conditions: ['cold', 'snow'], color: 'Grey', condition: 'good', assigned_to: ['everyone'] },
  { name: 'Winter Gloves', category: 'cold_weather', weather_conditions: ['cold', 'snow'], color: 'Black', condition: 'excellent', assigned_to: ['everyone'] },
  { name: 'Warm Hat', category: 'cold_weather', weather_conditions: ['cold', 'snow'], color: 'Navy', condition: 'good', assigned_to: ['everyone'] },
  
  // Sun protection
  { name: 'Sunglasses', category: 'sun_protection', weather_conditions: ['sunny', 'hot'], color: 'Black', condition: 'excellent', assigned_to: ['adults'] },
  { name: 'Sun Hat', category: 'sun_protection', weather_conditions: ['sunny', 'hot'], color: 'Beige', condition: 'good', assigned_to: ['everyone'] },
  { name: 'Sunscreen SPF 50', category: 'sun_protection', weather_conditions: ['sunny', 'hot'], color: 'White', condition: 'new', assigned_to: ['everyone'] },
  
  // Wind protection
  { name: 'Windbreaker', category: 'wind_protection', weather_conditions: ['windy'], color: 'Blue', condition: 'good', assigned_to: ['everyone'] }
];

async function addDataForSarah() {
  console.log('🚀 Adding mock data for Sarah Johnson...');

  try {
    // 1. Sign in as Sarah to get her real user ID
    console.log('🔐 Getting Sarah\'s user ID...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'sarah.johnson@example.com',
      password: 'password123'
    });

    if (signInError) {
      console.error('❌ Failed to sign in as Sarah:', signInError.message);
      return;
    }

    const sarahUserId = signInData.user.id;
    console.log(`✅ Found Sarah's user ID: ${sarahUserId}`);

    // 2. Update/create profile
    console.log('📝 Updating Sarah\'s profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: sarahUserId,
        email: 'sarah.johnson@example.com',
        full_name: 'Sarah Johnson',
        age: 28,
        gender: 'female',
        profession: 'Marketing Manager',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.log('⚠️  Profile update error:', profileError.message);
    } else {
      console.log('✅ Updated Sarah\'s profile');
    }

    // 3. Ensure categories exist
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
      }
    }

    // 4. Add family profiles
    console.log('👨‍👩‍👧‍👦 Adding Sarah\'s family profiles...');
    for (const profile of sarahFamilyProfiles) {
      const { data, error } = await supabase
        .from('wardrobe_profiles')
        .insert({
          user_id: sarahUserId,
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

    // 5. Add wardrobe items
    console.log('👗 Adding Sarah\'s wardrobe items...');
    for (const item of sarahWardrobeItems) {
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
            user_id: sarahUserId,
            category_id: categoryData.id,
            name: item.name,
            description: item.description,
            brand: item.brand,
            color: item.color,
            size: item.size,
            condition: item.condition,
            image_url: `/images/${item.image}`,
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
      }
    }

    // 6. Add weather essentials
    console.log('🌦️ Adding weather essentials for Sarah...');
    for (const essential of weatherEssentials) {
      const { data, error } = await supabase
        .from('weather_essentials')
        .insert({
          user_id: sarahUserId,
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

    console.log('\n🎉 Mock data for Sarah Johnson completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- User ID: ${sarahUserId}`);
    console.log(`- Added ${sarahWardrobeItems.length} wardrobe items`);
    console.log(`- Added ${sarahFamilyProfiles.length} family members`);
    console.log(`- Added ${weatherEssentials.length} weather essentials`);
    console.log(`- Added ${Object.keys(categories).length} categories`);
    
    console.log('\n🔐 Login Credentials:');
    console.log('- Email: sarah.johnson@example.com');
    console.log('- Password: password123');
    console.log('- Name: Sarah Johnson (28, Marketing Manager)');

  } catch (error) {
    console.error('❌ Error adding mock data for Sarah:', error);
  }
}

// Run the script
addDataForSarah();
