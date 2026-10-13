// Use dynamic imports to avoid ESM/CJS issues
import { Readable } from 'stream';
import { RFPExtractedData } from '../llm/types';

export interface FileParseResult {
  content: string;
  metadata: {
    fileName: string;
    fileType: 'pdf' | 'docx' | 'txt' | 'other';
    fileSize: number;
    pageCount?: number;
    wordCount: number;
    charCount: number;
  };
}

// Lazy load pdf-parse
let pdfParse: any = null;
async function getPDFParse() {
  if (!pdfParse) {
    const module = await import('pdf-parse');
    pdfParse = module.default || module;
  }
  return pdfParse;
}

// Lazy load mammoth
let mammoth: any = null;
async function getMammoth() {
  if (!mammoth) {
    const module = await import('mammoth');
    mammoth = module.default || module;
  }
  return mammoth;
}

/**
 * Parse a PDF file and extract text content
 */
export async function parsePDF(fileBuffer: Buffer, fileName: string): Promise<FileParseResult> {
  try {
    const pdfParse = await getPDFParse();
    const data = await pdfParse(fileBuffer);
    
    const content = data.text;
    const wordCount = countWords(content);
    const charCount = content.length;
    
    return {
      content,
      metadata: {
        fileName,
        fileType: 'pdf',
        fileSize: fileBuffer.length,
        pageCount: data.numpages,
        wordCount,
        charCount,
      },
    };
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse a DOCX file and extract text content
 */
export async function parseDOCX(fileBuffer: Buffer, fileName: string): Promise<FileParseResult> {
  try {
    const mammoth = await getMammoth();
    const result = await mammoth.extractRawText({ buffer: fileBuffer });
    const content = result.value;
    const wordCount = countWords(content);
    const charCount = content.length;
    
    return {
      content,
      metadata: {
        fileName,
        fileType: 'docx',
        fileSize: fileBuffer.length,
        wordCount,
        charCount,
      },
    };
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse a TXT file and extract text content
 */
export async function parseTXT(fileBuffer: Buffer, fileName: string): Promise<FileParseResult> {
  try {
    const content = fileBuffer.toString('utf-8');
    const wordCount = countWords(content);
    const charCount = content.length;
    
    return {
      content,
      metadata: {
        fileName,
        fileType: 'txt',
        fileSize: fileBuffer.length,
        wordCount,
        charCount,
      },
    };
  } catch (error) {
    console.error('Error parsing TXT:', error);
    throw new Error(`Failed to parse TXT: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Detect file type from buffer and file name
 */
export function detectFileType(fileBuffer: Buffer, fileName: string): 'pdf' | 'docx' | 'txt' | 'other' {
  // Check by file extension first
  const extension = fileName.toLowerCase().split('.').pop();
  
  if (extension === 'pdf') return 'pdf';
  if (extension === 'docx' || extension === 'doc') return 'docx';
  if (extension === 'txt' || extension === 'text') return 'txt';
  
  // Check by magic numbers if extension is not reliable
  if (fileBuffer.length >= 4) {
    // PDF: %PDF
    if (fileBuffer.subarray(0, 4).toString() === '%PDF') return 'pdf';
    
    // DOCX: PK (ZIP format)
    if (fileBuffer.subarray(0, 2).toString() === 'PK') return 'docx';
  }
  
  // Default to txt if it's a text file
  try {
    const content = fileBuffer.toString('utf-8');
    if (content.length > 0 && !content.includes('\0')) {
      return 'txt';
    }
  } catch {
    // Not a text file
  }
  
  return 'other';
}

/**
 * Parse any file based on its type
 */
export async function parseFile(fileBuffer: Buffer, fileName: string): Promise<FileParseResult> {
  const fileType = detectFileType(fileBuffer, fileName);
  
  switch (fileType) {
    case 'pdf':
      return parsePDF(fileBuffer, fileName);
    case 'docx':
      return parseDOCX(fileBuffer, fileName);
    case 'txt':
      return parseTXT(fileBuffer, fileName);
    default:
      throw new Error(`Unsupported file type: ${fileType}. Supported types: PDF, DOCX, TXT`);
  }
}

/**
 * Parse a file from a stream (for handling file uploads)
 */
export async function parseFileFromStream(
  stream: Readable,
  fileName: string
): Promise<FileParseResult> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    stream.on('data', (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    
    stream.on('end', async () => {
      try {
        const fileBuffer = Buffer.concat(chunks);
        const result = await parseFile(fileBuffer, fileName);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    
    stream.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Parse a file from a base64 string
 */
export async function parseFileFromBase64(
  base64String: string,
  fileName: string
): Promise<FileParseResult> {
  const fileBuffer = Buffer.from(base64String, 'base64');
  return parseFile(fileBuffer, fileName);
}

/**
 * Helper function to count words in text
 */
function countWords(text: string): number {
  // Remove punctuation and split by whitespace
  const words = text
    .replace(/[\n\r\t]/g, ' ')
    .replace(/[\.,\/#!$%\^&\*;:{}=\-_`~()\+\[\]\\|]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  return words.length;
}

/**
 * Validate that the file is not empty and is within size limits
 */
export function validateFile(fileBuffer: Buffer, maxSize: number = 50 * 1024 * 1024): {
  isValid: boolean;
  error?: string;
} {
  if (fileBuffer.length === 0) {
    return { isValid: false, error: 'File is empty' };
  }
  
  if (fileBuffer.length > maxSize) {
    return { isValid: false, error: `File is too large. Maximum size: ${maxSize / 1024 / 1024}MB` };
  }
  
  return { isValid: true };
}
