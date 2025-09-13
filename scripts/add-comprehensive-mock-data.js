const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock user profiles with different demographics
const mockUsers = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    full_name: 'Sarah Johnson',
    age: 28,
    gender: 'female',
    profession: 'Marketing Manager'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'mike.chen@example.com',
    password: 'password123',
    full_name: 'Mike Chen',
    age: 35,
    gender: 'male',
    profession: 'Software Engineer'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'emma.davis@example.com',
    password: 'password123',
    full_name: 'Emma Davis',
    age: 22,
    gender: 'female',
    profession: 'College Student'
  }
];

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

// Wardrobe items with images for different demographics
const wardrobeItems = {
  // Professional Female (Sarah, 28)
  '11111111-1111-1111-1111-111111111111': [
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
  ],

  // Tech Professional Male (Mike, 35)
  '22222222-2222-2222-2222-222222222222': [
    // Work/Casual (Tech environment)
    { name: 'Grey T-Shirt', category: 'tops', image: 'grey-t-shirt.png', occasion: 'work', color: 'Grey', size: 'L', brand: 'Uniqlo', condition: 'good', description: 'Comfortable grey t-shirt for office' },
    { name: 'Dark Blue Jeans', category: 'bottoms', image: 'dark-blue-summer-jeans.png', occasion: 'work', color: 'Dark Blue', size: '32', brand: 'Levi\'s', condition: 'good', description: 'Dark wash jeans suitable for tech office' },
    { name: 'Black Long Sleeve Top', category: 'tops', image: 'black-long-sleeve-top.png', occasion: 'work', color: 'Black', size: 'L', brand: 'J.Crew', condition: 'excellent', description: 'Professional black long sleeve shirt' },
    
    // Casual Weekend
    { name: 'Black V-Neck T-Shirt', category: 'tops', image: 'black-v-neck-tshirt.png', occasion: 'casual', color: 'Black', size: 'L', brand: 'Gap', condition: 'good', description: 'Casual black v-neck for weekends' },
    { name: 'Blue Denim Shorts', category: 'bottoms', image: 'blue-denim-shorts.png', occasion: 'casual', color: 'Blue', size: '32', brand: 'Patagonia', condition: 'good', description: 'Comfortable denim shorts for summer' },
    
    // Formal
    { name: 'White Shirt Navy Pants', category: 'outerwear', image: 'white-shirt-navy-pants.png', occasion: 'formal', color: 'Navy', size: 'L', brand: 'Brooks Brothers', condition: 'excellent', description: 'Classic formal shirt and pants combination' }
  ],

  // College Student Female (Emma, 22)
  '33333333-3333-3333-3333-333333333333': [
    // Casual/Student Life
    { name: 'Burgundy Summer Top', category: 'tops', image: 'burgundy-summer-top.png', occasion: 'casual', color: 'Burgundy', size: 'S', brand: 'Forever 21', condition: 'good', description: 'Trendy burgundy top for campus' },
    { name: 'White Denim Shorts', category: 'bottoms', image: 'white-denim-shorts.png', occasion: 'casual', color: 'White', size: '28', brand: 'American Eagle', condition: 'good', description: 'White denim shorts for summer' },
    { name: 'Burgundy Polka Dot Top', category: 'tops', image: 'burgundy-polka-dot-top.png', occasion: 'casual', color: 'Burgundy', size: 'S', brand: 'H&M', condition: 'excellent', description: 'Cute polka dot top for everyday wear' },
    { name: 'Cream Sleeveless Top', category: 'tops', image: 'cream-sleeveless-top.png', occasion: 'casual', color: 'Cream', size: 'S', brand: 'Zara', condition: 'good', description: 'Light sleeveless top for warm days' },
    
    // Party/Social
    { name: 'Purple Sequin Gown', category: 'dresses', image: 'purple-sequin-gown.png', occasion: 'party', color: 'Purple', size: 'S', brand: 'ASOS', condition: 'excellent', description: 'Sparkly purple gown for formal parties' },
    { name: 'Pink Heels', category: 'shoes', image: 'pink-heels.png', occasion: 'party', color: 'Pink', size: '7', brand: 'Steve Madden', condition: 'good', description: 'Fun pink heels for parties' },
    { name: 'Yellow Heels', category: 'shoes', image: 'yellow-heels.png', occasion: 'party', color: 'Yellow', size: '7', brand: 'Nine West', condition: 'excellent', description: 'Bright yellow heels for special occasions' },
    
    // Traditional/Cultural Events
    { name: 'Pink Kurta', category: 'traditional', image: 'pink-kurta.png', occasion: 'cultural', color: 'Pink', size: 'S', brand: 'Biba', condition: 'excellent', description: 'Traditional pink kurta for festivals' },
    { name: 'Peach Lehenga', category: 'traditional', image: 'peach-lehenga.png', occasion: 'cultural', color: 'Peach', size: 'S', brand: 'Kalki Fashion', condition: 'excellent', description: 'Beautiful peach lehenga for weddings' },
    { name: 'Blue Long Lehenga', category: 'traditional', image: 'blue-long-lehenga.png', occasion: 'cultural', color: 'Blue', size: 'S', brand: 'Sabyasachi', condition: 'excellent', description: 'Elegant blue lehenga for special occasions' }
  ]
};

// Family profiles for each user
const familyProfiles = {
  '11111111-1111-1111-1111-111111111111': [
    { name: 'David Johnson', relation: 'husband', age: 30, date_of_birth: '1994-03-15', is_owner: false },
    { name: 'Lily Johnson', relation: 'daughter', age: 5, date_of_birth: '2019-08-22', is_owner: false }
  ],
  '22222222-2222-2222-2222-222222222222': [
    { name: 'Lisa Chen', relation: 'wife', age: 32, date_of_birth: '1992-11-08', is_owner: false },
    { name: 'Alex Chen', relation: 'son', age: 8, date_of_birth: '2016-05-12', is_owner: false },
    { name: 'Sophie Chen', relation: 'daughter', age: 6, date_of_birth: '2018-09-30', is_owner: false }
  ],
  '33333333-3333-3333-3333-333333333333': [
    { name: 'Mom', relation: 'mother', age: 48, date_of_birth: '1976-04-18', is_owner: false },
    { name: 'Dad', relation: 'father', age: 50, date_of_birth: '1974-01-25', is_owner: false }
  ]
};

// Weather essentials for different weather conditions
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

async function addMockData() {
  console.log('🚀 Starting to add comprehensive mock data...');

  try {
    // 0. Create authentication accounts first
    console.log('🔐 Creating authentication accounts...');
    for (const user of mockUsers) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: user.email,
          password: user.password,
          options: {
            data: {
              full_name: user.full_name,
              age: user.age,
              gender: user.gender,
              profession: user.profession
            }
          }
        });

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`⚠️  User already exists: ${user.email}`);
          } else {
            console.error(`❌ Error creating auth account for ${user.email}:`, authError.message);
          }
        } else {
          console.log(`✅ Created auth account for ${user.full_name}`);
        }
      } catch (error) {
        console.log(`⚠️  Auth account creation failed for ${user.email}:`, error.message);
      }
    }

    // Wait a moment for auth accounts to be processed
    console.log('⏳ Waiting for auth accounts to be processed...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 1. Add mock users to profiles table
    console.log('📝 Adding user profiles...');
    for (const user of mockUsers) {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          age: user.age,
          gender: user.gender,
          profession: user.profession,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.log(`⚠️  Profile might already exist for ${user.full_name}:`, error.message);
      } else {
        console.log(`✅ Added profile for ${user.full_name}`);
      }
    }

    // 2. Ensure categories exist
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

    // 3. Add family profiles
    console.log('👨‍👩‍👧‍👦 Adding family profiles...');
    for (const [userId, profiles] of Object.entries(familyProfiles)) {
      for (const profile of profiles) {
        const { data, error } = await supabase
          .from('wardrobe_profiles')
          .insert({
            user_id: userId,
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
    }

    // 4. Add wardrobe items
    console.log('👗 Adding wardrobe items...');
    for (const [userId, items] of Object.entries(wardrobeItems)) {
      for (const item of items) {
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
              user_id: userId,
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
    }

    // 5. Add weather essentials
    console.log('🌦️ Adding weather essentials...');
    for (const userId of Object.keys(wardrobeItems)) {
      for (const essential of weatherEssentials) {
        const { data, error } = await supabase
          .from('weather_essentials')
          .insert({
            user_id: userId,
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
          console.log(`✅ Added weather essential: ${essential.name} for user ${userId}`);
        }
      }
    }

    console.log('🎉 Mock data addition completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Created ${mockUsers.length} authentication accounts`);
    console.log(`- Added ${mockUsers.length} user profiles`);
    console.log(`- Added ${Object.keys(categories).length} categories`);
    console.log(`- Added family profiles for each user`);
    console.log(`- Added wardrobe items with images for different occasions`);
    console.log(`- Added weather essentials for all weather conditions`);
    
    console.log('\n🔐 Login Credentials:');
    mockUsers.forEach(user => {
      console.log(`- Email: ${user.email} | Password: ${user.password}`);
      console.log(`  Name: ${user.full_name} (${user.age}, ${user.profession})`);
      console.log(`  User ID: ${user.id}\n`);
    });

  } catch (error) {
    console.error('❌ Error adding mock data:', error);
  }
}

// Run the script
addMockData();
