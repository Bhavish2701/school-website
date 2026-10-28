/**
 * Master Database Seeder for Sri Vidya School ERP
 * Runs all seed scripts sequentially with robust error checking
 */
const { execSync } = require('child_process');
const path = require('path');

const scripts = [
  'seed_rbac.js',
  'seed_teachers.js',
  'seed_students.js',
  'seed_parents.js',
  'seed_academic.js'
];

console.log('====================================================');
console.log('  STARTING COMPREHENSIVE DATABASE SEEDING');
console.log('====================================================');

for (const script of scripts) {
  const scriptPath = path.join(__dirname, script);
  console.log(`\n--> Running: ${script}...`);
  try {
    const output = execSync(`node "${scriptPath}"`, {
      cwd: path.join(__dirname, '..'),
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    console.log(output.trim());
  } catch (err) {
    console.error(`ERROR in ${script}:`, err.stdout || err.message);
    process.exit(1);
  }
}

console.log('\n====================================================');
console.log('  ALL SEEDING COMPLETED SUCCESSFULLY!');
console.log('====================================================\n');
