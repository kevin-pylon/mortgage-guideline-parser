#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import { MortgageRulesParser } from './app';

const program = new Command();

program
  .name('mortgage-rules-parser')
  .description('Parse PDF mortgage rules and generate TypeScript validation code')
  .version('1.0.0');

program
  .command('parse')
  .description('Parse a PDF file containing mortgage rules')
  .requiredOption('-f, --file <path>', 'Path to the PDF file')
  .requiredOption('-k, --openai-key <key>', 'OpenAI API key')
  .option('-o, --output <directory>', 'Output directory (default: ./output)', './output')
  .option('-l, --lender <name>', 'Lender name (default: Unknown Lender)', 'Unknown Lender')
  .option('-p, --program <name>', 'Program name (default: Standard Program)', 'Standard Program')
  .action(async (options) => {
    try {
      // Validate inputs
      if (!await fs.pathExists(options.file)) {
        console.error(chalk.red(`❌ PDF file not found: ${options.file}`));
        process.exit(1);
      }

      if (!options.openaiKey) {
        console.error(chalk.red('❌ OpenAI API key is required'));
        process.exit(1);
      }

      // Create parser instance
      const parser = new MortgageRulesParser(options.openaiKey);

      // Process the PDF
      await parser.processPDF(
        options.file,
        options.output,
        options.lender,
        options.program
      );

      console.log(chalk.green('\n🎉 Successfully processed mortgage rules!'));
      console.log(chalk.blue(`📁 Check the output directory: ${path.resolve(options.output)}`));

    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate a generated JSON schema')
  .requiredOption('-f, --file <path>', 'Path to the JSON schema file')
  .action(async (options) => {
    try {
      if (!await fs.pathExists(options.file)) {
        console.error(chalk.red(`❌ JSON file not found: ${options.file}`));
        process.exit(1);
      }

      const schema = await fs.readJson(options.file);
      
      console.log(chalk.blue('📋 Schema Validation Results:'));
      console.log(`   Lender: ${schema.lender || 'Not specified'}`);
      console.log(`   Program: ${schema.program || 'Not specified'}`);
      console.log(`   Version: ${schema.version || 'Not specified'}`);
      console.log(`   Total Rules: ${schema.rules?.length || 0}`);
      
      if (schema.metadata?.categories) {
        console.log('\n📊 Rule Categories:');
        Object.entries(schema.metadata.categories).forEach(([category, count]) => {
          console.log(`   ${category}: ${count} rules`);
        });
      }

      console.log(chalk.green('\n✅ Schema validation completed!'));

    } catch (error) {
      console.error(chalk.red('❌ Error validating schema:'), error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  });

// Show help if no command is provided
if (process.argv.length === 2) {
  program.help();
}

program.parse(); 