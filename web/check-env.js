// Quick script to check if environment variables are loaded
// Run with: node check-env.js

console.log('Checking environment variables...\n');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `✓ Set (${supabaseUrl.substring(0, 30)}...)` : '✗ NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `✓ Set (${supabaseAnonKey.substring(0, 30)}...)` : '✗ NOT SET');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('\n❌ Environment variables are missing!');
  console.log('Make sure .env.local exists in the web directory with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key');
  process.exit(1);
} else {
  console.log('\n✅ Environment variables are loaded correctly!');
  process.exit(0);
}

