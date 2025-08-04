# Mortgage Rules Parser - Application Summary

## Overview

This application is a complete solution for ingesting PDF documents containing mortgage lending rules and generating structured JSON schemas and TypeScript code for mortgage application validation. It leverages OpenAI's structured output feature to intelligently parse complex mortgage rules and convert them into production-ready code.

## Application Architecture

### Core Components

1. **PDF Parser Service** (`src/services/pdf-parser.ts`)
   - Extracts text content from PDF files
   - Preprocesses text for better AI analysis
   - Handles various PDF formats and structures

2. **OpenAI Parser Service** (`src/services/openai-parser.ts`)
   - Uses OpenAI's structured output feature
   - Parses mortgage rules into structured JSON
   - Generates TypeScript code from parsed rules
   - Validates and enhances schemas

3. **Main Application** (`src/app.ts`)
   - Orchestrates the entire parsing process
   - Manages file I/O and output generation
   - Provides comprehensive error handling
   - Generates summary reports

4. **CLI Interface** (`src/index.ts`)
   - Command-line interface for easy usage
   - Supports multiple commands (parse, validate)
   - Provides helpful error messages and guidance

5. **Type Definitions** (`src/types/mortgage-rules.ts`)
   - Comprehensive TypeScript interfaces
   - Defines mortgage rule structures
   - Supports multiple rule categories and constraint types

## Key Features

### 🎯 Intelligent Rule Parsing
- Automatically categorizes mortgage rules into logical groups
- Extracts specific constraints with values and conditions
- Identifies validation requirements and business logic
- Handles complex conditional rules and cross-field validations

### 💻 TypeScript Code Generation
- Generates production-ready TypeScript interfaces
- Creates validation functions with business logic
- Includes comprehensive error and warning handling
- Provides type-safe mortgage application validation

### 📊 Structured JSON Output
- Well-organized JSON schema for mortgage rules
- Metadata tracking and categorization
- Version control and effective date management
- Comprehensive rule documentation

### 🔧 Multiple Rule Categories
- Credit score requirements
- Income and employment requirements
- Debt-to-income ratio limits
- Down payment requirements
- Property type restrictions
- Documentation requirements
- Reserve requirements
- And many more...

## Usage Examples

### Command Line Usage

```bash
# Parse a PDF file
npm run dev -- parse \
  -f mortgage-rules.pdf \
  -k your-openai-api-key \
  -l "ABC Bank" \
  -p "Conventional Loan" \
  -o ./output

# Validate a generated schema
npm run dev -- validate -f ./output/mortgage-rules-schema.json
```

### Programmatic Usage

```typescript
import { MortgageRulesParser } from './src/app';

const parser = new MortgageRulesParser('your-openai-api-key');

await parser.processPDF(
  'path/to/mortgage-rules.pdf',
  './output',
  'ABC Bank',
  'Conventional Loan'
);
```

## Generated Output Files

1. **`mortgage-rules-schema.json`**
   - Structured JSON containing all parsed rules
   - Organized by categories and constraints
   - Includes metadata and version information

2. **`mortgage-rules.ts`**
   - TypeScript code with interfaces and validation functions
   - Production-ready validation logic
   - Type-safe mortgage application checking

3. **`extracted-text.txt`**
   - Raw text extracted from the PDF
   - Useful for debugging and verification

4. **`summary.md`**
   - Processing summary and statistics
   - Usage instructions and examples

## JSON Schema Structure

The application generates a comprehensive JSON schema that includes:

```json
{
  "version": "1.0.0",
  "lender": "ABC Bank",
  "program": "Conventional Loan",
  "effectiveDate": "2024-01-01",
  "rules": [
    {
      "id": "rule-001",
      "name": "Minimum Credit Score",
      "description": "Minimum credit score requirement",
      "category": "credit_score",
      "constraints": [
        {
          "id": "constraint-001",
          "name": "Minimum Credit Score",
          "type": "minimum",
          "field": "creditScore",
          "condition": "greater_than_or_equal",
          "value": 620,
          "description": "Minimum credit score of 620 required",
          "isRequired": true
        }
      ],
      "validationRules": [
        {
          "id": "validation-001",
          "name": "Credit Score Validation",
          "type": "field_validation",
          "condition": "creditScore >= 620",
          "message": "Credit score must be at least 620",
          "severity": "error"
        }
      ]
    }
  ],
  "metadata": {
    "totalRules": 15,
    "categories": {
      "credit_score": 3,
      "income_requirements": 4,
      "down_payment": 2
    },
    "generatedAt": "2024-01-15T10:30:00Z",
    "sourceDocument": "PDF"
  }
}
```

## Generated TypeScript Code

The application generates production-ready TypeScript code that includes:

- **Interfaces**: Type definitions for mortgage applications and rules
- **Enums**: Categorized rule types and validation severities
- **Validation Functions**: Business logic for rule checking
- **Constants**: Default values and configurations
- **Utility Functions**: Helper functions for rule processing

Example usage of generated code:

```typescript
import { validateMortgageApplication } from './output/mortgage-rules';

const application = {
  creditScore: 650,
  income: 75000,
  downPayment: 15000,
  debtToIncomeRatio: 0.35,
  propertyType: "Single Family",
  occupancy: "Primary Residence"
};

const result = validateMortgageApplication(application);
console.log("Is valid:", result.isValid);
console.log("Errors:", result.errors);
console.log("Warnings:", result.warnings);
```

## Error Handling

The application includes comprehensive error handling for:

- Missing or invalid PDF files
- OpenAI API errors and rate limits
- Invalid JSON responses from AI
- File system errors and permissions
- Network connectivity issues
- Invalid input parameters

## Testing

The application includes a comprehensive test suite:

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

Tests cover:
- PDF text extraction and preprocessing
- OpenAI response validation
- Schema enhancement and validation
- File I/O operations
- Error handling scenarios

## Dependencies

### Core Dependencies
- `pdf-parse`: PDF text extraction
- `openai`: OpenAI API integration
- `fs-extra`: Enhanced file system operations
- `commander`: CLI interface
- `chalk`: Colored console output

### Development Dependencies
- `typescript`: TypeScript compilation
- `ts-node`: TypeScript execution
- `jest`: Testing framework
- Various type definitions

## Installation and Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```

3. **Get OpenAI API key**:
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Use the key with the `-k` parameter

4. **Prepare your PDF**:
   - Ensure the PDF contains clear mortgage lending rules
   - The text should be extractable (not image-based)
   - Include specific requirements and constraints

## Performance Considerations

- **PDF Processing**: Handles large PDF files efficiently
- **AI Processing**: Uses OpenAI's latest models for accurate parsing
- **Memory Usage**: Processes files in chunks to minimize memory usage
- **Error Recovery**: Graceful handling of API failures and retries

## Security Features

- **API Key Protection**: Never logs or stores API keys
- **File Validation**: Validates input files before processing
- **Output Sanitization**: Cleans and validates generated content
- **Error Privacy**: Provides helpful errors without exposing sensitive data

## Future Enhancements

Potential improvements and extensions:

1. **Batch Processing**: Process multiple PDFs simultaneously
2. **Custom Rule Templates**: Support for custom rule formats
3. **Web Interface**: GUI for easier usage
4. **Database Integration**: Store and version rule schemas
5. **API Endpoints**: REST API for programmatic access
6. **Rule Versioning**: Track changes in mortgage rules over time
7. **Multi-language Support**: Support for different languages
8. **Advanced Validation**: More sophisticated validation logic

## Conclusion

This application provides a complete solution for converting PDF mortgage rules into structured, usable code. It leverages the power of AI to understand complex business rules and convert them into production-ready TypeScript code that can be used to validate mortgage applications programmatically.

The generated code is type-safe, well-documented, and follows TypeScript best practices, making it suitable for integration into existing mortgage processing systems. 