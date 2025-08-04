
import OpenAI from 'openai';
import { MortgageRulesSchema } from '../types/mortgage-types';

export class OpenAIParser {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  /**
   * Parses mortgage rules text using OpenAI's structured output feature
   * @param text Preprocessed text from PDF
   * @param lenderName Name of the lender
   * @param programName Name of the mortgage program
   * @returns Promise<MortgageRulesSchema> Structured mortgage rules
   */
  async parseMortgageRules(
    text: string, 
    lenderName: string = 'Unknown Lender',
    programName: string = 'Standard Program'
  ): Promise<MortgageRulesSchema> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert mortgage underwriter and software engineer. Your task is to analyze mortgage lending rules and convert them into a structured JSON schema that can be used to generate TypeScript code for mortgage application validation.

Key responsibilities:
1. Identify all mortgage rules, constraints, and validation requirements
2. Categorize rules into appropriate categories (income, credit, down payment, etc.)
3. Extract specific constraints with their values, conditions, and units
4. Create validation rules with appropriate severity levels
5. Ensure all rules are properly structured for TypeScript code generation

Focus on:
- Minimum/maximum values for various criteria
- Required documentation
- Employment requirements
- Credit score requirements
- Debt-to-income ratios
- Down payment requirements
- Property type restrictions
- Occupancy requirements
- Reserve requirements
- Any conditional logic or cross-field validations`
          },
          {
            role: "user",
            content: `Please analyze the following mortgage lending rules and convert them into a structured JSON schema. The text contains rules for ${lenderName}'s ${programName} program.

Text to analyze:
${text}

Please extract all mortgage rules, constraints, and validation requirements and structure them according to the provided schema.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      const parsedSchema = JSON.parse(content) as MortgageRulesSchema;
      
      // Validate and enhance the schema
      return this.validateAndEnhanceSchema(parsedSchema, lenderName, programName);
    } catch (error) {
      console.error('OpenAI parsing error:', error);
      if (error instanceof Error && error.message.includes('401')) {
        throw new Error(`Failed to parse mortgage rules with OpenAI: ${error.message}`);
      }
      throw new Error(`Failed to parse mortgage rules with OpenAI: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates and enhances the parsed schema with additional metadata
   */
  private validateAndEnhanceSchema(
    schema: MortgageRulesSchema, 
    lenderName: string, 
    programName: string
  ): MortgageRulesSchema {
    // Add metadata if not present
    if (!schema.metadata) {
      schema.metadata = {
        totalRules: schema.rules?.length || 0,
        categories: {} as Record<string, number>,
        generatedAt: new Date().toISOString(),
        sourceDocument: 'PDF'
      };
    }

    // Update basic fields
    schema.lender = lenderName;
    schema.program = programName;
    schema.version = schema.version || '1.0.0';
    schema.effectiveDate = schema.effectiveDate || new Date().toISOString().split('T')[0];

    // Calculate category counts
    if (schema.rules && Array.isArray(schema.rules)) {
      const categoryCounts: Record<string, number> = {};
      schema.rules.forEach(rule => {
        if (rule && typeof rule === 'object' && rule.category) {
          categoryCounts[rule.category] = (categoryCounts[rule.category] || 0) + 1;
        }
      });
      schema.metadata.categories = categoryCounts;
      schema.metadata.totalRules = schema.rules.length;
    } else {
      // Ensure rules is always an array
      schema.rules = [];
      schema.metadata.categories = {};
      schema.metadata.totalRules = 0;
    }

    return schema;
  }

  /**
   * Generates TypeScript code from the mortgage rules schema
   * @param schema The mortgage rules schema
   * @returns Promise<string> Generated TypeScript code
   */
  async generateTypeScriptCode(schema: MortgageRulesSchema): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert TypeScript developer. Your task is to generate TypeScript code from a mortgage rules schema that includes:

1. TypeScript interfaces for all mortgage rule types
2. Enums for categories, constraint types, and validation types
3. Validation functions that implement the business logic
4. Constants for default values and configurations
5. Utility functions for rule checking

The code should be production-ready, well-documented, and follow TypeScript best practices.`
          },
          {
            role: "user",
            content: `Please generate TypeScript code from the following mortgage rules schema:

${JSON.stringify(schema, null, 2)}

Generate complete TypeScript code that can be used to validate mortgage applications against these rules.`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      return content;
    } catch (error) {
      throw new Error(`Failed to generate TypeScript code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 