import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/fileProcessor';
import { extractCVData, removePersonalInfo, analyzeCVQuality, createAnonymousCandidate } from '@/lib/openai';
import { ProcessedCVData, InternalCVData } from '@/lib/types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('Starting CV upload processing...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      console.log('Invalid file type:', file.type);
      return NextResponse.json({ error: 'Invalid file type. Please upload PDF, DOC, DOCX, or TXT files.' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.log('File too large:', file.size);
      return NextResponse.json({ error: 'File size too large. Please upload files smaller than 10MB.' }, { status: 400 });
    }

    console.log('Extracting text from file...');
    // Extract text from file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await extractTextFromFile(fileBuffer, file.name);

    if (!extractedText) {
      console.log('No text extracted from file');
      return NextResponse.json({ error: 'Could not extract text from file' }, { status: 400 });
    }

    console.log('Text extracted, length:', extractedText.length);
    console.log('First 200 characters:', extractedText.substring(0, 200));

    console.log('Extracting CV data...');
    // Extract CV data
    const extractedData = await extractCVData(extractedText);

    console.log('Removing personal information...');
    // Remove personal information
    const personalInfoRemoved = await removePersonalInfo(extractedText);

    console.log('Analyzing CV quality...');
    // Analyze CV quality
    const analysis = await analyzeCVQuality(extractedText);

    // Create processed CV data
    const processedCVData: ProcessedCVData = {
      id: `cv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      originalFileName: file.name,
      originalContent: extractedText,
      extractedData,
      personalInfoRemoved,
      createdAt: new Date(),
    };

    // Create anonymous CV data for internal use
    const anonymousData = createAnonymousCandidate(extractedData);

    console.log('Saving to database...');
    // Save to database
    try {
      const savedCV = await prisma.processedCV.create({
        data: {
          id: processedCVData.id,
          originalFileName: processedCVData.originalFileName,
          originalContent: processedCVData.originalContent,
          extractedData: processedCVData.extractedData as any,
          personalInfoRemoved: processedCVData.personalInfoRemoved,
          createdAt: processedCVData.createdAt,
        },
      });

      // Save anonymous CV for internal use
      const savedAnonymousCV = await prisma.internalCV.create({
        data: {
          id: `internal-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
          candidateId: anonymousData.id,
          originalFileName: file.name,
          anonymousData: anonymousData as any,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      console.log('CV processed and saved:', savedCV.id);
      console.log('Anonymous CV saved for internal use:', savedAnonymousCV.id);

    } catch (dbError) {
      console.error('Database error:', dbError);
      // Continue without database save for now
    }

    console.log('Processing complete, returning response');
    return NextResponse.json({
      success: true,
      data: processedCVData,
      anonymousData,
      analysis,
    });

  } catch (error) {
    console.error('Error processing CV:', error);
    return NextResponse.json(
      { error: 'Failed to process CV' },
      { status: 500 }
    );
  }
}

