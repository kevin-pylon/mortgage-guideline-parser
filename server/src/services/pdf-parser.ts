import * as fs from 'fs-extra';
import pdf from 'pdf-parse';

export class PDFParser {
  /**
   * Extracts text content from a PDF file
   * @param filePath Path to the PDF file
   * @returns Promise<string> The extracted text content
   */
  async extractText(filePath: string): Promise<string> {
    try {
      // Check if file exists
      if (!await fs.pathExists(filePath)) {
        throw new Error(`PDF file not found: ${filePath}`);
      }

      // Read the PDF file
      const dataBuffer = await fs.readFile(filePath);
      
      // Parse the PDF
      const data = await pdf(dataBuffer);
      
      return data.text;
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Preprocesses the extracted text to clean it up for better AI processing
   * @param text Raw text from PDF
   * @returns Cleaned text
   */
  preprocessText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove page numbers and headers/footers
      .replace(/Page \d+ of \d+/gi, '')
      .replace(/^\d+\s*$/gm, '')
      // Clean up line breaks
      .replace(/\n\s*\n/g, '\n\n')
      // Remove special characters that might interfere with parsing
      .replace(/[^\w\s\.\,\;\:\!\?\-\(\)\[\]\{\}\"\']/g, ' ')
      .trim();
  }

  /**
   * Extracts and preprocesses text from PDF for mortgage rules analysis
   * @param filePath Path to the PDF file
   * @returns Promise<string> Preprocessed text ready for AI analysis
   */
  async extractMortgageRulesText(filePath: string): Promise<string> {
    const rawText = await this.extractText(filePath);
    return this.preprocessText(rawText);
  }
} 