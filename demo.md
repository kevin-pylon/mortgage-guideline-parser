# 🏠 Mortgage Rules Parser - Complete Demo

This guide demonstrates how to run and use the complete mortgage rules parser application with both frontend and backend components.

## 📋 Overview

The application consists of three main components:
1. **CLI Application** - Command-line interface for processing PDFs
2. **Frontend Web App** - Modern React interface for file upload and processing
3. **Backend API Server** - Express server handling file uploads and processing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn
- OpenAI API key

### 1. Install Dependencies

```bash
# Install CLI dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../server
npm install
```

### 2. Build All Components

```bash
# Build CLI application
npm run build

# Build frontend
cd frontend
npm run build

# Build backend
cd ../server
npm run build
```

### 3. Start the Backend Server

```bash
cd server
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
📁 API endpoints:
   POST /api/upload - Upload PDF file
   POST /api/parse - Parse mortgage rules
   GET  /api/health - Health check
```

### 4. Start the Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v4.5.14  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 5. Open the Application

Navigate to `http://localhost:3000` in your browser.

## 🎯 Using the Application

### Web Interface (Recommended)

1. **Upload PDF File**
   - Drag and drop a PDF file onto the upload area
   - Or click to browse and select a file
   - Only PDF files are supported (max 50MB)

2. **Configure Processing**
   - Enter the lender name (e.g., "ABC Bank")
   - Enter the program name (e.g., "Conventional Loan")
   - Enter your OpenAI API key
   - Click "Start Processing"

3. **View Results**
   - See the processing progress in real-time
   - Preview the generated JSON schema
   - Preview the generated TypeScript code
   - Download both files for use in your projects

### Command Line Interface

```bash
# Parse a PDF file
npm run dev -- parse \
  -f path/to/mortgage-rules.pdf \
  -k your-openai-api-key \
  -l "ABC Bank" \
  -p "Conventional Loan" \
  -o ./output

# Validate a generated schema
npm run dev -- validate -f ./output/mortgage-rules-schema.json
```

## 📊 Sample Output

### Generated JSON Schema

```json
{
  "version": "1.0.0",
  "lender": "ABC Bank",
  "program": "Conventional Loan",
  "effectiveDate": "2024-01-15",
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

### Generated TypeScript Code

```typescript
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

export function validateMortgageApplication(application: MortgageApplication): ValidationResult {
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
}
```

## 🔧 API Endpoints

### Backend Server (Port 3001)

- `POST /api/upload` - Upload PDF file
- `POST /api/parse` - Parse mortgage rules
- `GET /api/health` - Health check

### Frontend (Port 3000)

- `http://localhost:3000` - Main application interface

## 📁 Project Structure

```
mortgage-rules-parser/
├── src/                    # CLI application
│   ├── services/          # PDF and OpenAI services
│   ├── types/             # TypeScript interfaces
│   ├── app.ts             # Main application logic
│   └── index.ts           # CLI entry point
├── frontend/              # React web application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript interfaces
│   │   └── App.tsx        # Main React app
│   ├── package.json       # Frontend dependencies
│   └── vite.config.ts     # Vite configuration
├── server/                # Express API server
│   ├── src/
│   │   ├── services/      # Backend services
│   │   └── index.ts       # Express server
│   └── package.json       # Backend dependencies
├── sample-mortgage-rules.txt  # Sample data
├── README.md              # Main documentation
└── package.json           # CLI dependencies
```

## 🧪 Testing

### Run All Tests

```bash
# CLI tests
npm test

# Frontend tests (if configured)
cd frontend
npm test

# Backend tests (if configured)
cd ../server
npm test
```

### Manual Testing

1. **Test File Upload**
   - Try uploading different PDF files
   - Test file size limits
   - Test invalid file types

2. **Test Processing**
   - Use different lender names
   - Test with various program types
   - Verify OpenAI API integration

3. **Test Results**
   - Check JSON schema structure
   - Verify TypeScript code generation
   - Test download functionality

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check if ports are in use
   lsof -i :3000
   lsof -i :3001
   ```

2. **CORS Errors**
   - Ensure backend is running on port 3001
   - Check CORS configuration in server

3. **File Upload Issues**
   - Verify file is valid PDF
   - Check file size (max 50MB)
   - Ensure upload directory exists

4. **OpenAI API Errors**
   - Verify API key is correct
   - Check account has sufficient credits
   - Ensure API key has proper permissions

### Debug Mode

```bash
# Enable debug logging
DEBUG=* npm run dev

# Frontend debug
cd frontend
VITE_DEBUG=true npm run dev

# Backend debug
cd ../server
DEBUG=* npm run dev
```

## 📈 Performance

### Optimization Tips

1. **Large PDF Files**
   - Process files in chunks
   - Use streaming for large uploads
   - Implement progress indicators

2. **API Rate Limits**
   - Implement retry logic
   - Add request queuing
   - Cache processed results

3. **Memory Usage**
   - Clean up temporary files
   - Implement garbage collection
   - Monitor memory usage

## 🚀 Deployment

### Production Build

```bash
# Build all components
npm run build
cd frontend && npm run build
cd ../server && npm run build

# Start production server
cd ../server
npm start
```

### Environment Variables

```bash
# Backend
OPENAI_API_KEY=your-api-key
PORT=3001

# Frontend
VITE_API_BASE_URL=http://localhost:3001
```

## 🎉 Success!

You now have a complete mortgage rules parser application that can:

- ✅ Upload PDF files via web interface
- ✅ Process mortgage rules with AI
- ✅ Generate structured JSON schemas
- ✅ Create TypeScript validation code
- ✅ Download results for integration
- ✅ Handle errors gracefully
- ✅ Provide real-time feedback

The application is ready for production use and can be integrated into existing mortgage processing systems. 