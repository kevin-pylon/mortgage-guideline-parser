import * as fs from 'fs-extra';
import * as path from 'path';
import { PDFParser } from './services/pdf-parser';
import { OpenAIParser } from './services/openai-parser';
import { MortgageRulesSchema } from './types/mortgage-rules';

export class MortgageRulesParser {
  private pdfParser: PDFParser;
  private openaiParser: OpenAIParser;

  constructor(openaiApiKey: string) {
    this.pdfParser = new PDFParser();
    this.openaiParser = new OpenAIParser(openaiApiKey);
  }

  /**
   * Main method to process a PDF and generate structured output
   * @param pdfPath Path to the PDF file
   * @param outputDir Directory to save output files
   * @param lenderName Name of the lender
   * @param programName Name of the mortgage program
   * @returns Promise<void>
   */
  async processPDF(
    pdfPath: string,
    outputDir: string = './output',
    lenderName: string = 'Unknown Lender',
    programName: string = 'Standard Program'
  ): Promise<void> {
    try {
      console.log('🚀 Starting mortgage rules parsing...');
      
      // Step 1: Extract text from PDF
      console.log('📄 Extracting text from PDF...');
      const extractedText = await this.pdfParser.extractMortgageRulesText(pdfPath);
      console.log(`✅ Extracted ${extractedText.length} characters from PDF`);

      // Step 2: Parse rules using OpenAI
      console.log('🤖 Analyzing mortgage rules with OpenAI...');
      const mortgageRules = await this.openaiParser.parseMortgageRules(
        extractedText,
        lenderName,
        programName
      );
      console.log(`✅ Parsed ${mortgageRules.rules?.length || 0} mortgage rules`);

      // Step 3: Generate TypeScript code
      console.log('💻 Generating TypeScript code...');
      const typescriptCode = await this.openaiParser.generateTypeScriptCode(mortgageRules);
      console.log('✅ Generated TypeScript code');

      // Step 4: Save outputs
      console.log('💾 Saving output files...');
      await this.saveOutputs(outputDir, mortgageRules, typescriptCode, extractedText);
      console.log('✅ All outputs saved successfully!');

      // Step 5: Print summary
      this.printSummary(mortgageRules, outputDir);

    } catch (error) {
      console.error('❌ Error processing PDF:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  /**
   * Saves all output files to the specified directory
   */
  private async saveOutputs(
    outputDir: string,
    mortgageRules: MortgageRulesSchema,
    typescriptCode: string,
    extractedText: string
  ): Promise<void> {
    // Ensure output directory exists
    await fs.ensureDir(outputDir);

    // Save structured JSON schema
    const jsonPath = path.join(outputDir, 'mortgage-rules-schema.json');
    await fs.writeJson(jsonPath, mortgageRules, { spaces: 2 });

    // Save TypeScript code
    const tsPath = path.join(outputDir, 'mortgage-rules.ts');
    await fs.writeFile(tsPath, typescriptCode);

    // Save extracted text for reference
    const textPath = path.join(outputDir, 'extracted-text.txt');
    await fs.writeFile(textPath, extractedText);

    // Save a summary report
    const summaryPath = path.join(outputDir, 'summary.md');
    await this.generateSummaryReport(summaryPath, mortgageRules);
  }

  /**
   * Generates a summary report
   */
  private async generateSummaryReport(
    summaryPath: string,
    mortgageRules: MortgageRulesSchema
  ): Promise<void> {
    const summary = `# Mortgage Rules Processing Summary

## Overview
- **Lender**: ${mortgageRules.lender}
- **Program**: ${mortgageRules.program}
- **Version**: ${mortgageRules.version}
- **Effective Date**: ${mortgageRules.effectiveDate}
- **Total Rules**: ${mortgageRules.metadata.totalRules}

## Rule Categories
${Object.entries(mortgageRules.metadata.categories)
  .map(([category, count]) => `- ${category}: ${count} rules`)
  .join('\n')}

## Generated Files
- \`mortgage-rules-schema.json\`: Structured JSON schema
- \`mortgage-rules.ts\`: TypeScript code for validation
- \`extracted-text.txt\`: Raw extracted text from PDF
- \`summary.md\`: This summary report

## Processing Details
- **Generated At**: ${mortgageRules.metadata.generatedAt}
- **Source Document**: ${mortgageRules.metadata.sourceDocument}

## Usage
The generated TypeScript code can be imported and used to validate mortgage applications against the parsed rules.
`;

    await fs.writeFile(summaryPath, summary);
  }

  /**
   * Prints a summary to the console
   */
  private printSummary(mortgageRules: MortgageRulesSchema, outputDir: string): void {
    console.log('\n📊 Processing Summary:');
    console.log(`   Lender: ${mortgageRules.lender}`);
    console.log(`   Program: ${mortgageRules.program}`);
    console.log(`   Total Rules: ${mortgageRules.metadata.totalRules}`);
    console.log(`   Categories: ${Object.keys(mortgageRules.metadata.categories).length}`);
    console.log(`   Output Directory: ${outputDir}`);
    
    console.log('\n📁 Generated Files:');
    console.log(`   📄 mortgage-rules-schema.json`);
    console.log(`   💻 mortgage-rules.ts`);
    console.log(`   📝 extracted-text.txt`);
    console.log(`   📋 summary.md`);
    
    console.log('\n🎉 Processing complete! You can now use the generated TypeScript code for mortgage application validation.');
  }
} 