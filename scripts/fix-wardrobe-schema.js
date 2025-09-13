const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://xypmyqpkmnjbdbsfrgco.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.VgBJjMJJQOJJQOJJQOJJQOJJQOJJQOJJQOJJQOJJQOJ'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function fixWardrobeSchema() {
  console.log('🔧 Fixing wardrobe_items table schema...')
  
  try {
    // Check current table structure
    console.log('📋 Checking current table structure...')
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'wardrobe_items' })
    
    if (columnsError) {
      console.log('⚠️  Could not check table structure, proceeding with fixes...')
    } else {
      console.log('Current columns:', columns?.map(c => c.column_name) || 'Unknown')
    }

    // Add missing category column
    console.log('➕ Adding missing category column...')
    const { error: categoryError } = await supabase.rpc('exec_sql', {
      sql: `
        DO $$ 
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'wardrobe_items' 
                AND column_name = 'category'
            ) THEN
                ALTER TABLE wardrobe_items ADD COLUMN category TEXT;
                RAISE NOTICE 'Added category column to wardrobe_items table';
            ELSE
                RAISE NOTICE 'Category column already exists in wardrobe_items table';
            END IF;
        END $$;
      `
    })

    if (categoryError) {
      console.error('❌ Error adding category column:', categoryError)
      
      // Try direct SQL approach
      console.log('🔄 Trying direct SQL approach...')
      const { error: directError } = await supabase
        .from('wardrobe_items')
        .select('category')
        .limit(1)
      
      if (directError && directError.message.includes('column "category" does not exist')) {
        console.log('✅ Confirmed: category column is missing')
        
        // Use raw SQL to add the column
        const { error: rawSqlError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE wardrobe_items ADD COLUMN category TEXT;'
        })
        
        if (rawSqlError) {
          console.error('❌ Failed to add category column via raw SQL:', rawSqlError)
        } else {
          console.log('✅ Successfully added category column!')
        }
      }
    } else {
      console.log('✅ Category column check completed')
    }

    // Test the fix
    console.log('🧪 Testing the fix...')
    const { data: testData, error: testError } = await supabase
      .from('wardrobe_items')
      .select('id, name, category')
      .limit(1)
    
    if (testError) {
      console.error('❌ Test failed:', testError)
    } else {
      console.log('✅ Test passed! Table structure is now correct.')
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the fix
fixWardrobeSchema()
