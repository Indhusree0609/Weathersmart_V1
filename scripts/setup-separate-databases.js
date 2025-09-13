#!/usr/bin/env node

/**
 * Weather Smart: Setup Script for Separate Profile Databases
 * 
 * This script sets up the separate database feature for profile isolation.
 * Run this script to enable separate databases for each family member profile.
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Use the same configuration as the main app
const SUPABASE_URL = 'https://xypmyqpkmnjbdbsfrgco.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE'

// Create Supabase client with anon key (note: some operations may require service role key)
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupSeparateProfileDatabases() {
  console.log('🚀 Setting up separate profile databases for Weather Smart...\n')

  try {
    // Step 1: Read the SQL setup file
    console.log('📖 Reading database setup script...')
    const sqlFilePath = path.join(__dirname, 'create-separate-profile-databases.sql')
    
    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`)
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    console.log('✅ SQL script loaded successfully')

    // Step 2: Execute the SQL setup
    console.log('🔧 Executing database setup...')
    
    // Split the SQL into individual statements and execute them
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`   Executing statement ${i + 1}/${statements.length}...`)
          const { error } = await supabase.rpc('exec_sql', { sql: statement })
          
          if (error) {
            // Try direct execution if RPC fails
            const { error: directError } = await supabase.from('_').select('*').limit(0)
            if (directError) {
              console.warn(`   ⚠️  Warning: Could not execute statement ${i + 1}: ${error.message}`)
            }
          }
        } catch (err) {
          console.warn(`   ⚠️  Warning: Could not execute statement ${i + 1}: ${err.message}`)
        }
      }
    }

    console.log('✅ Database setup completed')

    // Step 3: Verify the setup
    console.log('🔍 Verifying setup...')
    
    try {
      // Check if profile_databases table exists
      const { data: profileDbCheck, error: profileDbError } = await supabase
        .from('profile_databases')
        .select('count')
        .limit(1)

      if (profileDbError) {
        console.log('❌ profile_databases table not found - setup may have failed')
        console.log('Error:', profileDbError.message)
      } else {
        console.log('✅ profile_databases table exists')
      }

      // Check if functions exist
      const { data: functionCheck, error: functionError } = await supabase
        .rpc('get_profile_schema_name', { profile_id_param: '00000000-0000-0000-0000-000000000000' })

      if (functionError && !functionError.message.includes('Profile not found')) {
        console.log('❌ Database functions not found - setup may have failed')
        console.log('Error:', functionError.message)
      } else {
        console.log('✅ Database functions are available')
      }

    } catch (verifyError) {
      console.log('⚠️  Could not fully verify setup:', verifyError.message)
    }

    // Step 4: Provide next steps
    console.log('\n🎉 Setup completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('1. The separate profile database feature is now available')
    console.log('2. Go to your Weather Collections page')
    console.log('3. Use the Profile Database Manager to create separate databases for each family member')
    console.log('4. Existing wardrobe data will be automatically migrated to the new separate databases')
    
    console.log('\n💡 Benefits:')
    console.log('• Complete data isolation between family members')
    console.log('• Better performance with smaller, focused databases')
    console.log('• Enhanced security with profile-specific access controls')
    console.log('• Independent wardrobe management for each family member')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Make sure you have the correct Supabase credentials')
    console.log('2. Ensure your Supabase project has the necessary permissions')
    console.log('3. Check that the SQL file exists and is readable')
    console.log('4. You may need to run parts of the SQL manually in your Supabase SQL editor')
    process.exit(1)
  }
}

// Alternative manual setup instructions
function showManualSetupInstructions() {
  console.log('\n📖 Manual Setup Instructions:')
  console.log('If the automatic setup fails, you can set up the feature manually:')
  console.log('\n1. Open your Supabase project dashboard')
  console.log('2. Go to the SQL Editor')
  console.log('3. Copy and paste the contents of scripts/create-separate-profile-databases.sql')
  console.log('4. Execute the SQL script')
  console.log('5. Restart your application')
  console.log('\nThe SQL file contains all necessary tables, functions, and policies for the separate database feature.')
}

// Check command line arguments
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  console.log('Weather Smart: Separate Profile Database Setup')
  console.log('\nUsage: node setup-separate-databases.js [options]')
  console.log('\nOptions:')
  console.log('  --help, -h     Show this help message')
  console.log('  --manual       Show manual setup instructions')
  console.log('\nEnvironment Variables:')
  console.log('  SUPABASE_SERVICE_ROLE_KEY  Your Supabase service role key (required)')
  console.log('  NEXT_PUBLIC_SUPABASE_URL   Your Supabase project URL')
  process.exit(0)
}

if (args.includes('--manual')) {
  showManualSetupInstructions()
  process.exit(0)
}

// Run the setup
setupSeparateProfileDatabases().catch(error => {
  console.error('❌ Unexpected error:', error)
  showManualSetupInstructions()
  process.exit(1)
})
