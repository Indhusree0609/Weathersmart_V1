const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://xypmyqpkmnjbdbsfrgco.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5cG15cXBrbW5qYmRic2ZyZ2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODkwMDUsImV4cCI6MjA2ODE2NTAwNX0.qs9IcBdpdzypjEulWtkSscr_mcPtXaDaR2WNXj5HRGE";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockUsers = [
  {
    email: 'sarah.johnson@example.com',
    password: 'password123',
    full_name: 'Sarah Johnson',
    age: 28,
    gender: 'female',
    profession: 'Marketing Manager'
  },
  {
    email: 'mike.chen@example.com',
    password: 'password123',
    full_name: 'Mike Chen',
    age: 35,
    gender: 'male',
    profession: 'Software Engineer'
  },
  {
    email: 'emma.davis@example.com',
    password: 'password123',
    full_name: 'Emma Davis',
    age: 22,
    gender: 'female',
    profession: 'College Student'
  }
];

async function createAuthAccounts() {
  console.log('🔐 Creating authentication accounts...');
  
  const createdUsers = [];

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
          // Try to get existing user info
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
          });
          
          if (signInData?.user) {
            createdUsers.push({
              ...user,
              id: signInData.user.id
            });
            console.log(`✅ Found existing user: ${user.full_name} (ID: ${signInData.user.id})`);
          }
        } else {
          console.error(`❌ Error creating auth account for ${user.email}:`, authError.message);
        }
      } else if (authData?.user) {
        createdUsers.push({
          ...user,
          id: authData.user.id
        });
        console.log(`✅ Created auth account for ${user.full_name} (ID: ${authData.user.id})`);
      }
    } catch (error) {
      console.error(`❌ Auth account creation failed for ${user.email}:`, error.message);
    }
  }

  console.log('\n🎉 Authentication accounts ready!');
  console.log('\n🔐 Login Credentials:');
  createdUsers.forEach(user => {
    console.log(`- Email: ${user.email} | Password: ${user.password}`);
    console.log(`  Name: ${user.full_name} (${user.age}, ${user.profession})`);
    console.log(`  User ID: ${user.id}\n`);
  });

  return createdUsers;
}

// Run the script
createAuthAccounts();
