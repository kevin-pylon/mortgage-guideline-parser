import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';
import { v4 as uuidv4 } from 'uuid';
import { PDFParser } from './services/pdf-parser';
import { OpenAIParser } from './services/openai-parser';
import { ConstraintGenerator } from './services/constraint-generator';
import { DemoParser } from './services/demo-parser';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    await fs.ensureDir(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Initialize services
const pdfParser = new PDFParser();

// Routes
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No PDF file uploaded',
      });
    }

    // Store file info in session (in production, use Redis or database)
    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      size: req.file.size,
    };

    // For demo purposes, store in memory (use Redis in production)
    (req as any).uploadedFile = fileInfo;

    res.json({
      success: true,
      message: 'PDF uploaded successfully',
      filename: req.file.filename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload PDF',
    });
  }
});

app.post('/api/parse', async (req, res) => {
  try {
    const { lenderName, programName, openaiApiKey } = req.body;

    if (!lenderName || !programName || !openaiApiKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: lenderName, programName, openaiApiKey',
      });
    }

    // Initialize services
    const pdfParser = new PDFParser();
    const openaiParser = new OpenAIParser(openaiApiKey);

    // Check for uploaded PDF files
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!await fs.pathExists(uploadsDir)) {
      await fs.ensureDir(uploadsDir);
    }
    
    const files = await fs.readdir(uploadsDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    if (pdfFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No uploaded PDF file found. Please upload a PDF first.',
      });
    }

    // Use the most recent PDF file
    const pdfFilePath = path.join(uploadsDir, pdfFiles[pdfFiles.length - 1]);

    // Extract text from PDF
    const extractedText = await pdfParser.extractText(pdfFilePath);
    const preprocessedText = pdfParser.preprocessText(extractedText);

    // Parse mortgage rules
    const mortgageRules = await openaiParser.parseMortgageRules(
      preprocessedText,
      lenderName,
      programName
    );

    // Generate TypeScript code
    const typescriptCode = await openaiParser.generateTypeScriptCode(mortgageRules);

    res.json({
      success: true,
      data: mortgageRules,
      typescriptCode,
    });
  } catch (error) {
    console.error('Parse error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse mortgage rules',
    });
  }
});

// Generate constraint nodes from mortgage rules
app.post('/api/generate-constraints', async (req, res) => {
  try {
    const { mortgageRules } = req.body;

    if (!mortgageRules) {
      return res.status(400).json({
        success: false,
        error: 'Missing mortgageRules in request body',
      });
    }

    // Generate constraint nodes
    const constraintNodes = ConstraintGenerator.generateAllConstraintNodes(mortgageRules);

    res.json({
      success: true,
      constraintNodes,
      totalNodes: constraintNodes.length,
      nodeTypes: {
        variables: constraintNodes.filter(n => n.typename === 'Variable').length,
        values: constraintNodes.filter(n => n.typename === 'Value').length,
        comparisonConstraints: constraintNodes.filter(n => n.typename === 'ComparisonConstraint').length,
        maintainRatioConstraints: constraintNodes.filter(n => n.typename === 'MaintainRatioConstraint').length,
        taskConstraints: constraintNodes.filter(n => n.typename === 'TaskConstraint').length,
        conditionalConstraints: constraintNodes.filter(n => n.typename === 'If').length,
        compositeConstraints: constraintNodes.filter(n => n.typename === 'AllOf' || n.typename === 'OneOf').length,
        affineExpressions: constraintNodes.filter(n => n.typename === 'AffineExpression').length,
        taskResults: constraintNodes.filter(n => n.typename === 'TaskResult').length,
      }
    });
  } catch (error) {
    console.error('Constraint generation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate constraint nodes',
    });
  }
});

// Parse PDF and generate constraint nodes in one step
app.post('/api/parse-and-generate-constraints', async (req, res) => {
  try {
    const { lenderName, programName, openaiApiKey } = req.body;

    if (!lenderName || !programName) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: lenderName, programName',
      });
    }

    // Initialize services
    const pdfParser = new PDFParser();
    let extractedText = '';
    let pdfFileName = 'demo-sample.pdf';

    // Check for uploaded PDF files
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!await fs.pathExists(uploadsDir)) {
      await fs.ensureDir(uploadsDir);
    }
    
    const files = await fs.readdir(uploadsDir);
    const pdfFiles = files.filter(file => file.endsWith('.pdf'));

    if (pdfFiles.length > 0) {
      // Use the most recent PDF file
      const pdfFilePath = path.join(uploadsDir, pdfFiles[pdfFiles.length - 1]);
      pdfFileName = pdfFiles[pdfFiles.length - 1];
      
      try {
        // Extract text from PDF
        extractedText = await pdfParser.extractText(pdfFilePath);
      } catch (error) {
        console.log('PDF extraction failed, using demo mode');
      }
    }

    // Use demo parser if no OpenAI key or PDF extraction failed
    if (!openaiApiKey || !extractedText) {
      const demoOutput = await DemoParser.processPDFAndGenerateConstraints(
        lenderName,
        programName,
        extractedText
      );
      
      // Update metadata with actual file info
      if (pdfFiles.length > 0) {
        demoOutput.metadata.sourceDocument = pdfFileName;
        demoOutput.metadata.extractedTextLength = extractedText.length;
      }
      
      return res.json(demoOutput);
    }

    // Use OpenAI parser if API key is provided
    const openaiParser = new OpenAIParser(openaiApiKey);
    const preprocessedText = pdfParser.preprocessText(extractedText);

    // Parse mortgage rules
    const mortgageRules = await openaiParser.parseMortgageRules(
      preprocessedText,
      lenderName,
      programName
    );

    // Generate TypeScript code
    const typescriptCode = await openaiParser.generateTypeScriptCode(mortgageRules);

    // Generate constraint nodes
    const constraintNodes = ConstraintGenerator.generateAllConstraintNodes(mortgageRules);

    // Create comprehensive output
    const output = {
      success: true,
      mortgageRules,
      typescriptCode,
      constraintNodes,
      totalNodes: constraintNodes.length,
      nodeTypes: {
        variables: constraintNodes.filter(n => n.typename === 'Variable').length,
        values: constraintNodes.filter(n => n.typename === 'Value').length,
        comparisonConstraints: constraintNodes.filter(n => n.typename === 'ComparisonConstraint').length,
        maintainRatioConstraints: constraintNodes.filter(n => n.typename === 'MaintainRatioConstraint').length,
        taskConstraints: constraintNodes.filter(n => n.typename === 'TaskConstraint').length,
        conditionalConstraints: constraintNodes.filter(n => n.typename === 'If').length,
        compositeConstraints: constraintNodes.filter(n => n.typename === 'AllOf' || n.typename === 'OneOf').length,
        affineExpressions: constraintNodes.filter(n => n.typename === 'AffineExpression').length,
        taskResults: constraintNodes.filter(n => n.typename === 'TaskResult').length,
      },
      metadata: {
        sourceDocument: pdfFileName,
        processedAt: new Date().toISOString(),
        lender: lenderName,
        program: programName,
        extractedTextLength: extractedText.length,
        preprocessedTextLength: preprocessedText.length,
        demoMode: false
      }
    };

    res.json(output);
  } catch (error) {
    console.error('Parse and generate error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse PDF and generate constraint nodes',
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 API endpoints:`);
  console.log(`   POST /api/upload - Upload PDF file`);
  console.log(`   POST /api/parse - Parse mortgage rules`);
  console.log(`   POST /api/generate-constraints - Generate constraint nodes`);
  console.log(`   POST /api/parse-and-generate-constraints - Parse PDF and generate constraint nodes`);
  console.log(`   GET  /api/health - Health check`);
}); 