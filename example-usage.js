#!/usr/bin/env node

/**
 * Example usage of the Mortgage Rules Parser
 * 
 * This script demonstrates how to use the application programmatically
 * without requiring a real PDF file or OpenAI API key.
 */

const { MortgageRulesParser } = require('./dist/app');

async function runExample() {
  console.log('🏠 Mortgage Rules Parser - Example Usage');
  console.log('==========================================\n');

  // Note: This is a demonstration script
  // In real usage, you would need:
  // 1. A real PDF file with mortgage rules
  // 2. A valid OpenAI API key
  
  console.log('📋 To use this application with a real PDF:');
  console.log('');
  console.log('1. Prepare your PDF file with mortgage lending rules');
  console.log('2. Get an OpenAI API key from https://platform.openai.com/api-keys');
  console.log('3. Run the parser:');
  console.log('');
  console.log('   npm run dev -- parse \\');
  console.log('     -f path/to/your/mortgage-rules.pdf \\');
  console.log('     -k your-openai-api-key \\');
  console.log('     -l "Your Bank Name" \\');
  console.log('     -p "Your Loan Program" \\');
  console.log('     -o ./output');
  console.log('');
  console.log('4. Check the generated files in the output directory:');
  console.log('   - mortgage-rules-schema.json (structured rules)');
  console.log('   - mortgage-rules.ts (TypeScript validation code)');
  console.log('   - extracted-text.txt (raw PDF text)');
  console.log('   - summary.md (processing summary)');
  console.log('');
  console.log('📝 Example of generated TypeScript usage:');
  console.log('');
  console.log('```typescript');
  console.log('import { validateMortgageApplication } from \'./output/mortgage-rules\';');
  console.log('');
  console.log('const application = {');
  console.log('  creditScore: 650,');
  console.log('  income: 75000,');
  console.log('  downPayment: 15000,');
  console.log('  debtToIncomeRatio: 0.35,');
  console.log('  propertyType: "Single Family",');
  console.log('  occupancy: "Primary Residence"');
  console.log('};');
  console.log('');
  console.log('const result = validateMortgageApplication(application);');
  console.log('console.log("Is valid:", result.isValid);');
  console.log('console.log("Errors:", result.errors);');
  console.log('console.log("Warnings:", result.warnings);');
  console.log('```');
  console.log('');
  console.log('🎯 The generated TypeScript code will include:');
  console.log('   - Type-safe interfaces for mortgage applications');
  console.log('   - Validation functions with business logic');
  console.log('   - Error and warning messages');
  console.log('   - Comprehensive rule checking');
  console.log('');
  console.log('📊 Supported rule categories:');
  console.log('   - Credit score requirements');
  console.log('   - Income and employment requirements');
  console.log('   - Debt-to-income ratio limits');
  console.log('   - Down payment requirements');
  console.log('   - Property type restrictions');
  console.log('   - Documentation requirements');
  console.log('   - And many more...');
  console.log('');
  console.log('🚀 Ready to process your mortgage rules!');
}

// Run the example
runExample().catch(console.error); 