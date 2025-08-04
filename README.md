# Mortgage Rules Parser

A powerful application that ingests PDF documents containing mortgage lending rules and generates structured JSON schemas and TypeScript code for mortgage application validation.

## Features

- 📄 **PDF Text Extraction**: Extracts and preprocesses text from PDF mortgage rule documents
- 🤖 **AI-Powered Parsing**: Uses OpenAI's structured output feature to intelligently parse mortgage rules
- 💻 **TypeScript Code Generation**: Automatically generates TypeScript interfaces and validation functions
- 📊 **Structured Output**: Creates well-organized JSON schemas for mortgage rules and constraints
- 🎯 **Multiple Categories**: Supports various mortgage rule categories (income, credit, down payment, etc.)
- 📋 **Validation Rules**: Generates comprehensive validation logic for mortgage applications

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd mortgage-rules-parser
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

## Usage

### Command Line Interface

The application provides a CLI for easy usage:

#### Parse a PDF file:
```bash
npm run dev -- parse \
  -f path/to/mortgage-rules.pdf \
  -k your-openai-api-key \
  -l "ABC Bank" \
  -p "Conventional Loan" \
  -o ./output
```

#### Validate a generated schema:
```bash
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

## Output Files

The application generates several output files:

- **`mortgage-rules-schema.json`**: Structured JSON schema containing all parsed mortgage rules
- **`mortgage-rules.ts`**: TypeScript code with interfaces, enums, and validation functions
- **`extracted-text.txt`**: Raw text extracted from the PDF for reference
- **`summary.md`**: Processing summary and usage instructions

## JSON Schema Structure

The generated JSON schema follows this structure:

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

## Supported Rule Categories

- **income_requirements**: Income and employment requirements
- **credit_score**: Credit score and credit history requirements
- **down_payment**: Down payment and equity requirements
- **debt_to_income_ratio**: DTI ratio limits and calculations
- **property_requirements**: Property type and condition requirements
- **documentation**: Required documentation and forms
- **employment**: Employment verification requirements
- **reserves**: Reserve and asset requirements
- **loan_amount**: Loan amount limits and restrictions
- **property_type**: Property type restrictions
- **occupancy**: Occupancy requirements
- **other**: Miscellaneous rules and requirements

## Generated TypeScript Code

The application generates production-ready TypeScript code including:

- **Interfaces**: Type definitions for all mortgage rule structures
- **Enums**: Categorized rule types and validation severities
- **Validation Functions**: Business logic for rule checking
- **Constants**: Default values and configurations
- **Utility Functions**: Helper functions for rule processing

## Environment Setup

### OpenAI API Key

You'll need an OpenAI API key to use this application. Get one from [OpenAI's platform](https://platform.openai.com/api-keys).

### Environment Variables (Optional)

You can set the OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

## Development

### Running in Development Mode

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm start
```

### Running Tests

```bash
npm test
```

## Example Usage

1. **Prepare your PDF**: Ensure your PDF contains clear mortgage lending rules and requirements.

2. **Run the parser**:
```bash
npm run dev -- parse \
  -f mortgage-rules.pdf \
  -k sk-your-openai-api-key \
  -l "My Bank" \
  -p "FHA Loan Program"
```

3. **Check the output**:
```bash
ls -la output/
```

4. **Use the generated TypeScript code**:
```typescript
import { validateMortgageApplication } from './output/mortgage-rules';

const application = {
  creditScore: 650,
  income: 75000,
  downPayment: 15000,
  // ... other fields
};

const validationResult = validateMortgageApplication(application);
console.log(validationResult.isValid);
console.log(validationResult.errors);
```

## Error Handling

The application includes comprehensive error handling for:

- Missing or invalid PDF files
- OpenAI API errors
- Invalid JSON responses
- File system errors
- Network connectivity issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions, please open an issue on the repository. 