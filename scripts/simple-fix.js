const { createClient } = require('@supabase/supabase-js')

// Use your environment variables
const SUPABASE_URL = 'https://xypmyqpkmnjbdbsfrgco.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function testAndFix() {
  console.log('🔍 Testing wardrobe_items table...')
  
  try {
    // Test if we can select from the table
    const { data, error } = await supabase
      .from('wardrobe_items')
      .select('id, name, category')
      .limit(1)
    
    if (error) {
      console.error('❌ Error accessing wardrobe_items:', error.message)
      
      if (error.message.includes('category')) {
        console.log('🔧 The category column is missing!')
        console.log('📋 Please run this SQL in your Supabase dashboard:')
        console.log('ALTER TABLE wardrobe_items ADD COLUMN category TEXT;')
      }
    } else {
      console.log('✅ Table structure looks good!')
      console.log('Data sample:', data)
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

testAndFix()
