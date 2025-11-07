// Verify .env.local file format
// This script uses dotenv to load and check the file

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

console.log('Checking .env.local file...\n');

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found at:', envPath);
  console.log('\nPlease create the file with:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

console.log('✓ .env.local file exists\n');

// Read the file
const content = fs.readFileSync(envPath, 'utf8');
const lines = content.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));

console.log('Found', lines.length, 'non-empty, non-comment lines:\n');

lines.forEach((line, index) => {
  const trimmed = line.trim();
  if (trimmed.includes('=')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('='); // Rejoin in case value contains =
    
    console.log(`Line ${index + 1}:`);
    console.log(`  Key: ${key.trim()}`);
    console.log(`  Value: ${value.trim() ? value.trim().substring(0, 50) + (value.trim().length > 50 ? '...' : '') : '(empty)'}`);
    
    // Check for common issues
    if (key.includes(' ')) {
      console.log(`  ⚠️  Warning: Key has spaces: "${key}"`);
    }
    if (value.trim() === '') {
      console.log(`  ❌ Error: Value is empty!`);
    }
    if (!key.startsWith('NEXT_PUBLIC_')) {
      console.log(`  ⚠️  Warning: Key doesn't start with NEXT_PUBLIC_`);
    }
    console.log('');
  } else {
    console.log(`Line ${index + 1}: ${trimmed}`);
    console.log(`  ⚠️  Warning: Line doesn't contain '='`);
    console.log('');
  }
});

// Check for required variables
const hasUrl = lines.some(line => line.includes('NEXT_PUBLIC_SUPABASE_URL'));
const hasKey = lines.some(line => line.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY'));

console.log('\nRequired variables check:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', hasUrl ? '✓ Found' : '❌ Missing');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', hasKey ? '✓ Found' : '❌ Missing');

if (!hasUrl || !hasKey) {
  console.log('\n❌ Missing required variables!');
  console.log('\nYour .env.local should contain exactly:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

console.log('\n✅ File format looks correct!');
console.log('\nNote: This script only checks format. To verify Next.js loads them,');
console.log('check the build output for "- Environments: .env.local"');

