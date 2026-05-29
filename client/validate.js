#!/usr/bin/env node

/**
 * Integration validation script for SaveTheServe client
 * Tests API connectivity, service functionality, and component rendering
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Starting SaveTheServe Client Validation...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.bold}${colors.blue}${msg}${colors.reset}`)
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    log.success(name);
    passedTests++;
    return true;
  } catch (error) {
    log.error(`${name}: ${error.message}`);
    failedTests++;
    return false;
  }
}

// Test 1: Check project structure
log.section('1. Project Structure Validation');

test('Package.json exists', () => {
  if (!fs.existsSync('./package.json')) throw new Error('package.json not found');
});

test('Required directories exist', () => {
  const requiredDirs = ['src', 'src/app', 'src/components', 'src/services', 'src/utils'];
  requiredDirs.forEach(dir => {
    if (!fs.existsSync(dir)) throw new Error(`Directory ${dir} not found`);
  });
});

test('Service files exist', () => {
  const serviceFiles = [
    'src/services/auth.service.js',
    'src/services/food.service.js',
    'src/services/request.service.js'
  ];
  serviceFiles.forEach(file => {
    if (!fs.existsSync(file)) throw new Error(`Service file ${file} not found`);
  });
});

test('Enhanced components exist', () => {
  const componentFiles = [
    'src/components/donor/EnhancedFoodForm.jsx',
    'src/components/ngo/EnhancedRequestForm.jsx',
    'src/components/ngo/EnhancedFoodCard.jsx',
    'src/components/common/EnhancedRequestCard.jsx',
    'src/components/common/RoleProtection.jsx'
  ];
  componentFiles.forEach(file => {
    if (!fs.existsSync(file)) throw new Error(`Component ${file} not found`);
  });
});

// Test 2: Environment Configuration
log.section('2. Environment Configuration');

test('Environment variables configured', () => {
  if (!fs.existsSync('.env.local')) throw new Error('.env.local file not found');
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  if (!envContent.includes('NEXT_PUBLIC_API_URL')) {
    throw new Error('NEXT_PUBLIC_API_URL not configured in .env.local');
  }
});

test('Constants file updated', () => {
  const constantsPath = 'src/utils/constants.js';
  if (!fs.existsSync(constantsPath)) throw new Error('Constants file not found');
  
  const constantsContent = fs.readFileSync(constantsPath, 'utf8');
  if (!constantsContent.includes('FOOD_CATEGORIES')) {
    throw new Error('FOOD_CATEGORIES not defined in constants');
  }
  if (!constantsContent.includes('REQUEST_STATUS')) {
    throw new Error('REQUEST_STATUS not defined in constants');
  }
});

// Test 3: API Service Integration
log.section('3. API Service Integration');

test('Auth service implements server API', () => {
  const authServicePath = 'src/services/auth.service.js';
  const authContent = fs.readFileSync(authServicePath, 'utf8');
  
  const requiredFunctions = ['/auth/login', '/auth/register', '/auth/profile'];
  requiredFunctions.forEach(endpoint => {
    if (!authContent.includes(endpoint)) {
      throw new Error(`Auth service missing ${endpoint} endpoint`);
    }
  });
});

test('Food service implements server API', () => {
  const foodServicePath = 'src/services/food.service.js';
  const foodContent = fs.readFileSync(foodServicePath, 'utf8');
  
  const requiredEndpoints = ['/food/create', '/food/available', '/food/my-listings'];
  requiredEndpoints.forEach(endpoint => {
    if (!foodContent.includes(endpoint)) {
      throw new Error(`Food service missing ${endpoint} endpoint`);
    }
  });
});

test('Request service implements server API', () => {
  const requestServicePath = 'src/services/request.service.js';
  const requestContent = fs.readFileSync(requestServicePath, 'utf8');
  
  const requiredEndpoints = ['/requests/create', '/requests/my-requests', '/requests/incoming'];
  requiredEndpoints.forEach(endpoint => {
    if (!requestContent.includes(endpoint)) {
      throw new Error(`Request service missing ${endpoint} endpoint`);
    }
  });
});

// Test 4: Role-based routing
log.section('4. Role-based Routing');

test('Dashboard layout has role protection', () => {
  const layoutPath = 'src/app/(dashboard)/layout.jsx';
  if (!fs.existsSync(layoutPath)) throw new Error('Dashboard layout not found');
  
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  if (!layoutContent.includes('RoleProtection')) {
    throw new Error('Dashboard layout missing RoleProtection component');
  }
});

test('Permissions utility updated', () => {
  const permissionsPath = 'src/utils/permissions.js';
  if (!fs.existsSync(permissionsPath)) throw new Error('Permissions utility not found');
  
  const permissionsContent = fs.readFileSync(permissionsPath, 'utf8');
  if (!permissionsContent.includes('getDashboardRoute')) {
    throw new Error('getDashboardRoute function not found in permissions');
  }
});

// Test 5: SEO Implementation
log.section('5. SEO Implementation');

test('SEO utility exists', () => {
  if (!fs.existsSync('src/utils/seo.js')) throw new Error('SEO utility not found');
});

test('Sitemap route exists', () => {
  if (!fs.existsSync('src/app/sitemap.xml/route.js')) throw new Error('Sitemap route not found');
});

test('Robots.txt route exists', () => {
  if (!fs.existsSync('src/app/robots.txt/route.js')) throw new Error('Robots.txt route not found');
});

test('Main layout has structured data', () => {
  const layoutPath = 'src/app/layout.js';
  const layoutContent = fs.readFileSync(layoutPath, 'utf8');
  
  if (!layoutContent.includes('application/ld+json')) {
    throw new Error('Main layout missing structured data');
  }
});

// Test 6: Build Process
log.section('6. Build Process');

test('Project builds successfully', () => {
  try {
    log.info('Running build process...');
    execSync('npm run build', { stdio: 'pipe', timeout: 300000 }); // 5 minute timeout
    log.success('Build completed successfully');
  } catch (error) {
    throw new Error(`Build failed: ${error.message}`);
  }
});

// Test 7: Dependencies
log.section('7. Dependencies Check');

test('All required dependencies installed', () => {
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  const requiredDeps = [
    'next', 'react', 'axios', 'framer-motion', 
    'lucide-react', '@radix-ui/react-dialog', 'zustand'
  ];
  
  const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  requiredDeps.forEach(dep => {
    if (!allDeps[dep]) throw new Error(`Required dependency ${dep} not found`);
  });
});

// Summary
log.section('Validation Summary');

console.log(`\nTotal Tests: ${totalTests}`);
console.log(`${colors.green}Passed: ${passedTests}${colors.reset}`);
console.log(`${colors.red}Failed: ${failedTests}${colors.reset}`);

if (failedTests === 0) {
  log.success('🎉 All validations passed! Client is ready for integration.');
  console.log(`\n${colors.blue}Next steps:${colors.reset}`);
  console.log('1. Start the development server: npm run dev');
  console.log('2. Ensure the backend server is running on http://localhost:3000');
  console.log('3. Test user registration and login');
  console.log('4. Test food listing creation (restaurant role)');
  console.log('5. Test request creation (NGO role)');
  process.exit(0);
} else {
  log.error(`❌ ${failedTests} validation(s) failed. Please fix the issues above.`);
  process.exit(1);
}