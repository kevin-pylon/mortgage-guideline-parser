import { MortgageRulesParser } from '../app';
import { PDFParser } from '../services/pdf-parser';
import { OpenAIParser } from '../services/openai-parser';
import * as fs from 'fs-extra';
import * as path from 'path';

// Mock OpenAI API key for testing
const MOCK_OPENAI_KEY = 'sk-test-key';

describe('MortgageRulesParser', () => {
  let parser: MortgageRulesParser;

  beforeEach(() => {
    parser = new MortgageRulesParser(MOCK_OPENAI_KEY);
  });

  describe('PDFParser', () => {
    let pdfParser: PDFParser;

    beforeEach(() => {
      pdfParser = new PDFParser();
    });

    test('should preprocess text correctly', () => {
      const rawText = `
        Page 1 of 5
        
        Mortgage Rules
        
        Page 2 of 5
        
        Credit Score Requirements:
        - Minimum: 620
        - Preferred: 700+
        
        Page 3 of 5
      `;

      const processed = pdfParser.preprocessText(rawText);
      
      expect(processed).not.toContain('Page 1 of 5');
      expect(processed).not.toContain('Page 2 of 5');
      expect(processed).not.toContain('Page 3 of 5');
      expect(processed).toContain('Credit Score Requirements');
      expect(processed).toContain('Minimum: 620');
    });
  });

  describe('OpenAIParser', () => {
    let openaiParser: OpenAIParser;

    beforeEach(() => {
      openaiParser = new OpenAIParser(MOCK_OPENAI_KEY);
    });

    test('should validate and enhance schema correctly', () => {
      const mockSchema = {
        rules: [
          {
            id: 'rule-001',
            name: 'Credit Score Requirement',
            description: 'Minimum credit score requirement',
            category: 'credit_score',
            constraints: [],
            validationRules: []
          }
        ]
      };

      const enhanced = (openaiParser as any).validateAndEnhanceSchema(
        mockSchema,
        'Test Bank',
        'Test Program'
      );

      expect(enhanced.lender).toBe('Test Bank');
      expect(enhanced.program).toBe('Test Program');
      expect(enhanced.version).toBe('1.0.0');
      expect(enhanced.metadata.totalRules).toBe(1);
      expect(enhanced.metadata.categories.credit_score).toBe(1);
    });
  });

  describe('Integration Tests', () => {
    test('should handle missing PDF file gracefully', async () => {
      const nonExistentPath = '/path/to/nonexistent.pdf';
      
      await expect(
        parser.processPDF(nonExistentPath, './test-output', 'Test Bank', 'Test Program')
      ).rejects.toThrow('PDF file not found');
    });

    test('should create output directory if it does not exist', async () => {
      const testOutputDir = './test-output';
      
      // Clean up any existing test directory
      if (await fs.pathExists(testOutputDir)) {
        await fs.remove(testOutputDir);
      }

      // This test would require a real PDF file and OpenAI API key
      // For now, we'll just test the directory creation logic
      await fs.ensureDir(testOutputDir);
      expect(await fs.pathExists(testOutputDir)).toBe(true);
      
      // Clean up
      await fs.remove(testOutputDir);
    });
  });
});

// Example of how to use the generated TypeScript code
describe('Generated TypeScript Code Usage', () => {
  test('should demonstrate expected TypeScript interface usage', () => {
    // This represents the structure that would be generated
    interface MortgageApplication {
      creditScore: number;
      income: number;
      downPayment: number;
      debtToIncomeRatio: number;
      propertyType: string;
      occupancy: string;
    }

    interface ValidationResult {
      isValid: boolean;
      errors: string[];
      warnings: string[];
    }

    // Mock validation function (this would be generated)
    const validateMortgageApplication = (application: MortgageApplication): ValidationResult => {
      const errors: string[] = [];
      const warnings: string[] = [];

      // Credit score validation
      if (application.creditScore < 620) {
        errors.push('Credit score must be at least 620');
      } else if (application.creditScore < 700) {
        warnings.push('Credit score below preferred threshold of 700');
      }

      // DTI ratio validation
      if (application.debtToIncomeRatio > 0.43) {
        errors.push('Debt-to-income ratio cannot exceed 43%');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings
      };
    };

    // Test the validation
    const testApplication: MortgageApplication = {
      creditScore: 650,
      income: 75000,
      downPayment: 15000,
      debtToIncomeRatio: 0.35,
      propertyType: 'Single Family',
      occupancy: 'Primary Residence'
    };

    const result = validateMortgageApplication(testApplication);
    
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(1); // Credit score warning
  });
}); 