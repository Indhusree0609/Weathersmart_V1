const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tara's 15 dresses collection
const taraDresses = [
  // First 10 from your table
  {
    name: "Birthday Tutu Dress",
    description: "Pink tulle dress with sparkly bodice and layered tutu skirt",
    brand: "Disney Princess",
    color: "Pink",
    size: "4T",
    occasions: ["birthday", "party"],
    safety_features: ["flame_resistant", "non_toxic_materials"]
  },
  {
    name: "Floral Summer Dress",
    description: "Light blue dress with white floral pattern and cap sleeves",
    brand: "Carter's",
    color: "Light Blue",
    size: "4T",
    occasions: ["casual", "summer"],
    safety_features: ["breathable_fabric", "non_toxic_dyes"]
  },
  {
    name: "Rainbow Stripe Dress",
    description: "Colorful horizontal stripe dress with short sleeves",
    brand: "H&M Kids",
    color: "Multicolor",
    size: "4T",
    occasions: ["casual", "play"],
    safety_features: ["machine_washable", "colorfast"]
  },
  {
    name: "Unicorn Print Dress",
    description: "White dress with rainbow unicorn graphics and glitter details",
    brand: "Jumping Beans",
    color: "White",
    size: "4T",
    occasions: ["casual", "party"],
    safety_features: ["lead_free_prints", "hypoallergenic"]
  },
  {
    name: "Denim Jumper Dress",
    description: "Classic blue denim jumper with adjustable straps",
    brand: "OshKosh B'gosh",
    color: "Blue",
    size: "4T",
    occasions: ["casual", "school"],
    safety_features: ["durable_construction", "reinforced_seams"]
  },
  {
    name: "Polka Dot Sundress",
    description: "Yellow sundress with white polka dots and tie straps",
    brand: "Gymboree",
    color: "Yellow",
    size: "4T",
    occasions: ["summer", "casual"],
    safety_features: ["UV_protection", "quick_dry"]
  },
  {
    name: "Princess Costume Dress",
    description: "Purple satin dress with gold trim and attached cape",
    brand: "Disney Store",
    color: "Purple",
    size: "4T",
    occasions: ["costume", "dress_up"],
    safety_features: ["flame_resistant", "secure_fastenings"]
  },
  {
    name: "Butterfly Print Dress",
    description: "Coral dress with colorful butterfly pattern and flutter sleeves",
    brand: "Tea Collection",
    color: "Coral",
    size: "4T",
    occasions: ["spring", "casual"],
    safety_features: ["organic_cotton", "eco_friendly_dyes"]
  },
  {
    name: "Gingham Check Dress",
    description: "Red and white gingham dress with puffed sleeves and bow belt",
    brand: "Bonnie Jean",
    color: "Red",
    size: "4T",
    occasions: ["formal", "special_events"],
    safety_features: ["wrinkle_resistant", "stain_resistant"]
  },
  {
    name: "Mermaid Sequin Dress",
    description: "Teal dress with reversible sequins and mermaid tail design",
    brand: "Justice",
    color: "Teal",
    size: "4T",
    occasions: ["party", "special_events"],
    safety_features: ["secure_sequins", "comfortable_lining"]
  },
  // Additional 5 from the images
  {
    name: "Smocked Polka Dot Dress",
    description: "Pink dress with white polka dots, smocked bodice and puffed sleeves",
    brand: "Petit Bateau",
    color: "Pink",
    size: "4T",
    occasions: ["casual", "spring"],
    safety_features: ["breathable_fabric", "gentle_elastic"]
  },
  {
    name: "Striped Tank Dress",
    description: "Yellow and cream horizontal striped sleeveless dress",
    brand: "Mini Boden",
    color: "Yellow",
    size: "4T",
    occasions: ["summer", "casual"],
    safety_features: ["UV_protection", "moisture_wicking"]
  },
  {
    name: "Ice Cream Applique Dress",
    description: "White dress with pastel ice cream cone applique and colorful hem",
    brand: "Hanna Andersson",
    color: "White",
    size: "4T",
    occasions: ["summer", "casual"],
    safety_features: ["non_toxic_appliques", "machine_washable"]
  },
  {
    name: "Floral Embroidered Dress",
    description: "Purple dress with red and orange floral embroidery panel",
    brand: "Zara Kids",
    color: "Purple",
    size: "4T",
    occasions: ["casual", "spring"],
    safety_features: ["hand_embroidered", "natural_fibers"]
  },
  {
    name: "Eyelet Lace Dress",
    description: "Cream sleeveless dress with delicate eyelet lace pattern",
    brand: "Janie and Jack",
    color: "Cream",
    size: "4T",
    occasions: ["formal", "special_events"],
    safety_features: ["breathable_cotton", "gentle_construction"]
  }
];

async function addTaraDresses() {
  console.log('👗 Starting to add Tara\'s dress collection...');

  try {
    // First, get the current user ID (you'll need to replace this with your actual user ID)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('⚠️  No authenticated user found. Please make sure you\'re logged in.');
      console.log('You can manually set the user_id in the script if needed.');
      return;
    }

    const userId = user.id;
    console.log(`👤 Adding dresses for user: ${userId}`);

    // Get the dresses category ID
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('name', 'Dresses')
      .single();

    if (categoryError || !categories) {
      console.error('❌ Could not find Dresses category:', categoryError);
      return;
    }

    const dressesCategory = categories.id;
    console.log(`📂 Found Dresses category: ${dressesCategory}`);

    // Add each dress to the wardrobe
    let successCount = 0;
    let errorCount = 0;

    for (const dress of taraDresses) {
      try {
        const wardrobeItem = {
          user_id: userId,
          name: dress.name,
          description: dress.description,
          category_id: dressesCategory,
          brand: dress.brand,
          color: dress.color,
          size: dress.size,
          condition: 'excellent', // Assuming new dresses
          weather_suitable: ['mild', 'warm'], // Most dresses suitable for mild/warm weather
          seasonal_use: ['spring', 'summer'], // Most appropriate for spring/summer
          occasions: dress.occasions,
          age_appropriate: true, // All dresses are for Tara (kid)
          safety_features: dress.safety_features,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('wardrobe_items')
          .insert(wardrobeItem);

        if (error) {
          console.error(`❌ Error adding ${dress.name}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Added: ${dress.name}`);
          successCount++;
        }

        // Small delay to avoid overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Unexpected error adding ${dress.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n🎉 Bulk import completed!');
    console.log(`✅ Successfully added: ${successCount} dresses`);
    console.log(`❌ Failed to add: ${errorCount} dresses`);
    console.log(`👗 Total dresses in Tara's collection: ${successCount}`);

  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

// Run the script
addTaraDresses();
