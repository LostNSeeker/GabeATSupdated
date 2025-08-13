import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

// Enhanced text extraction with OCR improvements
export async function extractTextFromFile(buffer: Buffer, fileName: string): Promise<string> {
  const fileExtension = fileName.toLowerCase().split('.').pop();
  
  try {
    let extractedText = '';
    
    switch (fileExtension) {
      case 'pdf':
        extractedText = await extractTextFromPDF(buffer);
        break;
      case 'doc':
      case 'docx':
        extractedText = await extractTextFromWord(buffer);
        break;
      case 'txt':
        extractedText = await extractTextFromPlainText(buffer);
        break;
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`);
    }
    
    // Clean and normalize the extracted text
    return cleanExtractedText(extractedText, fileExtension);
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from ${fileName}: ${error}`);
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

async function extractTextFromWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    console.error('Word document parsing error:', error);
    throw new Error('Failed to parse Word document');
  }
}

async function extractTextFromPlainText(buffer: Buffer): Promise<string> {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Text file parsing error:', error);
    throw new Error('Failed to parse text file');
  }
}

function cleanExtractedText(text: string, fileType: string): string {
  switch (fileType) {
    case 'pdf':
      return cleanOCRText(text);
    case 'doc':
    case 'docx':
      return cleanWordText(text);
    case 'txt':
      return cleanPlainText(text);
    default:
      return text;
  }
}

function cleanOCRText(text: string): string {
  return text
    // Remove common OCR artifacts
    .replace(/[^\w\s\-.,;:!?@#$%&*()+=<>[\]{}|\\/]/g, '') // Remove special characters that might be OCR errors
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .replace(/[|]/g, 'I') // Common OCR mistake: | -> I
    .replace(/[0]/g, 'O') // Common OCR mistake: 0 -> O in certain contexts
    .replace(/[1]/g, 'l') // Common OCR mistake: 1 -> l in certain contexts
    .trim();
}

function cleanWordText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .replace(/[^\w\s\-.,;:!?@#$%&*()+=<>[\]{}|\\/\n]/g, '') // Remove unwanted characters
    .trim();
}

function cleanPlainText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n\n') // Remove excessive line breaks
    .trim();
}

// Enhanced table detection and extraction
export async function extractTableData(text: string): Promise<Array<Array<string>>> {
  const lines = text.split('\n');
  const tables: Array<Array<string>> = [];
  let currentTable: Array<Array<string>> = [];
  
  for (const line of lines) {
    // Simple table detection based on consistent separators
    if (line.includes('|') || line.includes('\t') || line.match(/\s{3,}/)) {
      const cells = line.split(/[|\t]|\s{3,}/).map(cell => cell.trim()).filter(Boolean);
      if (cells.length > 1) {
        currentTable.push(cells);
      }
    } else if (currentTable.length > 0) {
      if (currentTable.length > 1) {
        tables.push(...currentTable);
      }
      currentTable = [];
    }
  }
  
  return tables;
}

// Document structure detection
export async function detectDocumentStructure(text: string): Promise<{
  confidence: number;
  hasContactInfo: boolean;
  hasExperience: boolean;
  hasEducation: boolean;
  hasSkills: boolean;
}> {
  const lowerText = text.toLowerCase();
  
  // Contact information detection
  const hasContactInfo = /email|phone|mobile|address|@|\.com|\.org|\.net/.test(lowerText);
  
  // Experience detection
  const hasExperience = /experience|work|employment|job|position|role|company|employer/.test(lowerText);
  
  // Education detection
  const hasEducation = /education|degree|university|college|school|bachelor|master|phd|diploma|certificate/.test(lowerText);
  
  // Skills detection
  const hasSkills = /skills|technologies|tools|programming|languages|frameworks|software/.test(lowerText);
  
  // Calculate confidence based on detected sections
  const detectedSections = [hasContactInfo, hasExperience, hasEducation, hasSkills].filter(Boolean).length;
  const confidence = Math.min(100, (detectedSections / 4) * 100);
  
  return {
    confidence,
    hasContactInfo,
    hasExperience,
    hasEducation,
    hasSkills,
  };
}

// Enhanced contact information extraction
export async function extractContactInfo(text: string): Promise<{
  email?: string;
  phone?: string;
  name?: string;
  location?: string;
}> {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  const phoneMatch = text.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
  
  // Name extraction (look for common patterns)
  const nameMatch = text.match(/\b[A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?\b/);
  
  // Location extraction (look for city, state patterns)
  const locationMatch = text.match(/\b[A-Z][a-z]+(?:[,\s]+[A-Z]{2})?\b/);
  
  return {
    email: emailMatch?.[0],
    phone: phoneMatch?.[0],
    name: nameMatch?.[0],
    location: locationMatch?.[0],
  };
}

