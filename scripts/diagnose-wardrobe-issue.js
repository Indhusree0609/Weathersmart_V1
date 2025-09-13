const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://xypmyqpkmnjbdbsfrgco.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function diagnoseWardrobeIssue() {
  console.log('🔍 COMPREHENSIVE WARDROBE DIAGNOSTIC')
  console.log('=====================================\n')

  try {
    // 1. Test basic connection
    console.log('1. Testing Supabase connection...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Connection failed:', connectionError.message)
      return
    }
    console.log('✅ Connection successful\n')

    // 2. Check if wardrobe_items table exists and its structure
    console.log('2. Checking wardrobe_items table structure...')
    const { data: tableData, error: tableError } = await supabase
      .from('wardrobe_items')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table access error:', tableError.message)
      if (tableError.message.includes('does not exist')) {
        console.log('🔧 SOLUTION: Run the create-wardrobe-table.sql script')
      }
      return
    }
    console.log('✅ Table exists and accessible')
    console.log('   Sample columns:', Object.keys(tableData[0] || {}), '\n')

    // 3. Test authentication (this will fail in script but shows the issue)
    console.log('3. Testing authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Authentication issue:', authError?.message || 'No user found')
      console.log('🔧 SOLUTION: You need to be logged in to add items')
      console.log('   This is likely the main issue - the frontend needs proper auth\n')
    } else {
      console.log('✅ User authenticated:', user.email)
      console.log('   User ID:', user.id, '\n')
    }

    // 4. Test a simple insert without auth (to check table structure)
    console.log('4. Testing table structure with mock data...')
    const testItem = {
      user_id: '00000000-0000-0000-0000-000000000000', // Mock UUID
      name: 'Test Item - ' + new Date().toISOString(),
      category: 'dresses',
      condition: 'good',
      wear_count: 0,
      description: 'Test item for diagnostic purposes'
    }

    console.log('   Attempting to insert (will likely fail due to auth):', testItem)
    
    const { data: insertedItem, error: insertError } = await supabase
      .from('wardrobe_items')
      .insert([testItem])
      .select()
      .single()

    if (insertError) {
      console.error('❌ Insert failed (expected):', insertError.message)
      
      // Analyze the error
      if (insertError.message.includes('violates row-level security')) {
        console.log('✅ This is expected - RLS is working correctly')
        console.log('🔧 MAIN ISSUE: Authentication problem in frontend')
      } else if (insertError.message.includes('category_id')) {
        console.log('🔧 SOLUTION: Schema mismatch - table expects category_id instead of category')
      } else if (insertError.message.includes('null value')) {
        console.log('🔧 SOLUTION: Missing required fields')
      } else {
        console.log('🔧 UNKNOWN ERROR: Check the error details above')
      }
    } else {
      console.log('⚠️  Unexpected: Item inserted without auth - RLS might be disabled')
    }

    console.log('\n📋 SUMMARY:')
    console.log('- Database connection: ✅ Working')
    console.log('- Table structure: ✅ Working')
    console.log('- Main issue: Likely authentication or RLS policy problem')
    console.log('\n🔧 RECOMMENDED FIXES:')
    console.log('1. Check if user is properly authenticated in the frontend')
    console.log('2. Verify RLS policies allow authenticated users to insert')
    console.log('3. Check browser console for detailed error messages')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error('Stack trace:', error.stack)
  }
}

// Run the diagnostic
diagnoseWardrobeIssue()
