const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co"
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4OTAwNSwiZXhwIjoyMDY4MTY1MDA1fQ.VgBJjMJJQOJJQOJJQOJJQOJJQOJJQOJJQOJJQOJJQOJ"

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createWeatherEssentialsTable() {
  try {
    console.log('🚀 Creating weather_essentials table...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create-weather-essentials-table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      console.error('❌ Error creating weather_essentials table:', error)
      
      // Try alternative approach - execute each statement separately
      console.log('🔄 Trying alternative approach...')
      
      const statements = sql.split(';').filter(stmt => stmt.trim())
      
      for (const statement of statements) {
        if (statement.trim()) {
          const { error: stmtError } = await supabase.rpc('exec_sql', { 
            sql_query: statement.trim() + ';' 
          })
          
          if (stmtError) {
            console.error('❌ Error executing statement:', statement.substring(0, 50) + '...', stmtError)
          } else {
            console.log('✅ Executed:', statement.substring(0, 50) + '...')
          }
        }
      }
    } else {
      console.log('✅ Weather essentials table created successfully!')
    }
    
    // Verify table creation
    const { data: tableCheck, error: checkError } = await supabase
      .from('weather_essentials')
      .select('count')
      .limit(1)
    
    if (checkError) {
      console.error('❌ Table verification failed:', checkError)
    } else {
      console.log('✅ Table verification successful!')
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run if called directly
if (require.main === module) {
  createWeatherEssentialsTable()
}

module.exports = { createWeatherEssentialsTable }
