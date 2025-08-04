# Mortgage Rules Parser - Frontend

A modern React web application for uploading PDF mortgage rule documents and generating structured JSON schemas and TypeScript code.

## Features

- 📄 **Drag & Drop PDF Upload** - Easy file upload with visual feedback
- 🤖 **AI-Powered Processing** - Uses OpenAI to intelligently parse mortgage rules
- 💻 **TypeScript Code Generation** - Automatically generates validation functions
- 📊 **Real-time Results** - Live preview of JSON schema and TypeScript code
- 🎨 **Modern UI** - Beautiful, responsive design with Tailwind CSS
- 📱 **Mobile Friendly** - Works seamlessly on all devices

## Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

### Backend Setup

The frontend requires the backend server to be running. See the server README for setup instructions.

## Usage

### 1. Upload PDF File
- Drag and drop a PDF file onto the upload area
- Or click to browse and select a file
- Only PDF files are supported (max 50MB)

### 2. Configure Processing
- Enter the lender name (e.g., "ABC Bank")
- Enter the program name (e.g., "Conventional Loan")
- Enter your OpenAI API key
- Click "Start Processing"

### 3. View Results
- See the processing progress in real-time
- Preview the generated JSON schema
- Preview the generated TypeScript code
- Download both files for use in your projects

## API Integration

The frontend communicates with the backend via REST API:

### Endpoints

- `POST /api/upload` - Upload PDF file
- `POST /api/parse` - Parse mortgage rules
- `GET /api/health` - Health check

### Example API Usage

```typescript
// Upload PDF
const formData = new FormData();
formData.append('pdf', file);
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

// Parse rules
const parseResponse = await fetch('/api/parse', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lenderName: 'ABC Bank',
    programName: 'Conventional Loan',
    openaiApiKey: 'sk-...',
  }),
});
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── FileUpload.tsx      # PDF upload component
│   │   ├── ParsingForm.tsx     # Configuration form
│   │   ├── ResultsView.tsx     # Results display
│   │   └── LoadingSpinner.tsx  # Loading indicator
│   ├── services/
│   │   └── api.ts              # API service functions
│   ├── types/
│   │   └── api.ts              # TypeScript interfaces
│   ├── utils/
│   │   └── cn.ts               # Utility functions
│   ├── App.tsx                 # Main application
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── package.json                # Dependencies
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS config
└── tsconfig.json               # TypeScript config
```

## Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Dropzone** - File upload
- **Lucide React** - Icons

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS compatibility

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3001
```

### Customization

#### Styling
The application uses Tailwind CSS. Customize the design by modifying:
- `tailwind.config.js` - Theme configuration
- `src/index.css` - Global styles
- Component-specific classes

#### API Configuration
Modify `src/services/api.ts` to change API endpoints or add new functionality.

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

### Deploy to Netlify

1. Build the project:
   ```bash
   npm run build
   ```

2. Upload the `dist/` folder to Netlify

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure the backend server is running on port 3001
   - Check that CORS is properly configured

2. **File Upload Fails**
   - Verify the file is a valid PDF
   - Check file size (max 50MB)
   - Ensure backend upload directory exists

3. **OpenAI API Errors**
   - Verify your API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure the API key has proper permissions

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
VITE_DEBUG=true npm run dev
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the backend server logs
- Open an issue on the repository 