import OpenAI from 'openai';
import { Candidate, AnonymousCandidate } from './types';
import { detectDocumentStructure, extractContactInfo } from './fileProcessor';

// Initialize OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Function to create anonymous candidate data for internal use
export function createAnonymousCandidate(candidate: Candidate): AnonymousCandidate {
  // Generate a unique ID based on timestamp and random string
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  const candidateId = `CV-${timestamp}-${randomStr}`.toUpperCase();
  
  return {
    id: candidateId,
    title: candidate.title,
    summary: candidate.summary,
    sectionOrder: candidate.sectionOrder,
    skills: candidate.skills,
    education: candidate.education,
    experience: candidate.experience,
    culturalFitRating: candidate.culturalFitRating,
    linkedinQuestions: candidate.linkedinQuestions,
  };
}

export async function extractCVData(cvText: string): Promise<Candidate> {
  // First, analyze document structure
  const structure = await detectDocumentStructure(cvText);
  const contactInfo = await extractContactInfo(cvText);
  
  // If no OpenAI API key, use fallback extraction
  if (!openai) {
    return extractCVDataFallback(cvText, structure, contactInfo);
  }

  const prompt = `
You are an advanced CV/Resume data extraction system with expertise in parsing various document formats and extracting structured information.

DOCUMENT ANALYSIS:
- Document confidence: ${structure.confidence}%
- Has contact info: ${structure.hasContactInfo}
- Has experience: ${structure.hasExperience}
- Has education: ${structure.hasEducation}
- Has skills: ${structure.hasSkills}

EXTRACTED CONTACT INFO:
- Email: ${contactInfo.email || 'Not found'}
- Phone: ${contactInfo.phone || 'Not found'}
- Name: ${contactInfo.name || 'Not found'}
- Location: ${contactInfo.location || 'Not found'}

TASK: Extract comprehensive information from this CV/Resume and return it as a JSON object matching this exact structure:

{
  "fullName": "string (extract from document or use provided name)",
  "title": "string (current or most recent job title/position)",
  "email": "string (extract email address)",
  "phone": "string (extract phone number)",
  "location": "string (city, state/province, country)",
  "website": "string (personal website/portfolio if available)",
  "profilePic": "string (leave empty, will be handled separately)",
  "summary": "string (professional summary/objective, generate if not present)",
  "sectionOrder": ["skills", "experience", "education"],
  "skills": ["array", "of", "technical", "and", "soft", "skills"],
  "education": [
    {
      "school": "string (institution name)",
      "degree": "string (degree type and field)",
      "period": "string (e.g., 2018-2022 or Graduation Year)"
    }
  ],
  "experience": [
    {
      "company": "string (company/organization name)",
      "role": "string (job title/position)",
      "period": "string (e.g., 2020-Present or 2020-2023)",
      "details": ["array", "of", "key", "responsibilities", "and", "achievements"]
    }
  ],
  "culturalFitRating": 4,
  "linkedinQuestions": [
    {
      "id": "1",
      "question": "What motivates you to work in a global environment?",
      "answer": "Generated response based on candidate's background and experience",
      "category": "personal"
    },
    {
      "id": "2", 
      "question": "How has your background shaped your approach to building professional relationships?",
      "answer": "Generated response based on candidate's experience and skills",
      "category": "personal"
    },
    {
      "id": "3",
      "question": "What's a personal story you'd share on LinkedIn to showcase your professional journey?", 
      "answer": "Generated response based on candidate's achievements and background",
      "category": "linkedin"
    },
    {
      "id": "4",
      "question": "How do you define success in your personal and professional life?",
      "answer": "Generated response based on candidate's values and experience",
      "category": "linkedin"
    },
    {
      "id": "5",
      "question": "What personal qualities do you bring to a team, and how have you developed them?",
      "answer": "Generated response based on candidate's skills and experience",
      "category": "linkedin"
    }
  ]
}

EXTRACTION RULES:
1. Extract ALL available information from the CV text
2. For missing information, use reasonable defaults or empty strings
3. Generate a professional summary if not present, based on experience and skills
4. Identify and extract technical skills, soft skills, and tools/technologies
5. Parse work experience with company names, roles, dates, and key achievements
6. Extract education details including institutions, degrees, and graduation periods
7. Generate 5 LinkedIn-style questions with contextual answers based on the candidate's background
8. Set culturalFitRating (1-5) based on experience level, skills diversity, and professional achievements
9. Ensure all dates are in consistent format (YYYY-YYYY or YYYY-Present)
10. Return ONLY valid JSON, no additional text or explanations

CV TEXT TO ANALYZE:
${cvText}

Return the extracted data as a valid JSON object:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional CV data extraction assistant with expertise in parsing resumes and extracting structured information. Always return valid JSON without any additional text or explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const extractedText = response.choices[0]?.message?.content;
    if (!extractedText) {
      throw new Error('No response from OpenAI');
    }

    // Clean the response to ensure it's valid JSON
    const jsonStart = extractedText.indexOf('{');
    const jsonEnd = extractedText.lastIndexOf('}') + 1;
    const jsonString = extractedText.slice(jsonStart, jsonEnd);

    const parsedData = JSON.parse(jsonString) as Candidate;
    
    // Validate and set defaults with enhanced logic
    return {
      fullName: parsedData.fullName || contactInfo.name || 'Unknown Candidate',
      title: parsedData.title || 'Professional',
      email: parsedData.email || contactInfo.email || 'email@example.com',
      phone: parsedData.phone || contactInfo.phone || '+1 (000) 000-0000',
      location: parsedData.location || contactInfo.location || 'Location Not Specified',
      website: parsedData.website || '',
      profilePic: parsedData.profilePic || '',
      summary: parsedData.summary || generateDefaultSummary(parsedData),
      sectionOrder: parsedData.sectionOrder || determineSectionOrder(parsedData),
      skills: parsedData.skills || [],
      education: parsedData.education || [],
      experience: parsedData.experience || [],
      culturalFitRating: parsedData.culturalFitRating || calculateCulturalFit(parsedData),
      linkedinQuestions: parsedData.linkedinQuestions || generateLinkedInQuestions(parsedData),
    };
  } catch (error) {
    console.error('Error extracting CV data:', error);
    // Fallback to basic extraction
    return extractCVDataFallback(cvText, structure, contactInfo);
  }
}

// Fallback function for when OpenAI is not available
function extractCVDataFallback(cvText: string, structure: any, contactInfo: any): Candidate {
  console.log('Using fallback CV data extraction (no OpenAI API key)');
  
  // Basic extraction using regex patterns
  const lines = cvText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Extract basic information
  const name = contactInfo.name || lines.find(line => 
    line.match(/^[A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?$/) && 
    !line.match(/email|phone|address|experience|education|skills/i)
  ) || 'Unknown Candidate';
  
  // Extract skills (look for common skill patterns)
  const skills = extractSkillsFromText(cvText);
  
  // Extract experience (basic pattern matching)
  const experience = extractExperienceFromText(cvText);
  
  // Extract education (basic pattern matching)
  const education = extractEducationFromText(cvText);
  
  return {
    fullName: name,
    title: 'Professional',
    email: contactInfo.email || 'email@example.com',
    phone: contactInfo.phone || '+1 (000) 000-0000',
    location: contactInfo.location || 'Location Not Specified',
    website: '',
    profilePic: '',
    summary: generateDefaultSummary({ experience, skills }),
    sectionOrder: determineSectionOrder({ experience, skills, education }) as ('skills' | 'experience' | 'education')[],
    skills,
    education,
    experience,
    culturalFitRating: calculateCulturalFit({ experience, skills, education }),
    linkedinQuestions: generateLinkedInQuestions({ experience, skills }),
  };
}

function extractSkillsFromText(text: string): string[] {
  const skillPatterns = [
    /javascript|js|react|angular|vue|node\.js|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin/gi,
    /html|css|sass|less|bootstrap|tailwind|material-ui/gi,
    /sql|mysql|postgresql|mongodb|redis|elasticsearch/gi,
    /docker|kubernetes|aws|azure|gcp|heroku/gi,
    /git|github|gitlab|bitbucket|jenkins|ci\/cd/gi,
    /agile|scrum|kanban|waterfall/gi,
    /leadership|management|communication|teamwork/gi
  ];
  
  const skills = new Set<string>();
  
  skillPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        skills.add(match.toLowerCase());
      });
    }
  });
  
  return Array.from(skills).slice(0, 10); // Limit to 10 skills
}

function extractExperienceFromText(text: string): Array<{
  company: string;
  role: string;
  period: string;
  details: string[];
}> {
  const experience: Array<{
    company: string;
    role: string;
    period: string;
    details: string[];
  }> = [];
  
  // Basic pattern matching for experience
  const lines = text.split('\n');
  let currentExp: any = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for company/role patterns
    if (line.match(/^[A-Z][A-Za-z\s&]+$/) && line.length > 3 && line.length < 50) {
      if (currentExp) {
        experience.push(currentExp);
      }
      currentExp = {
        company: line,
        role: 'Professional',
        period: '2020-Present',
        details: []
      };
    }
    
    // Look for bullet points
    if (line.match(/^[•·▪▫\-\*]\s/) && currentExp) {
      currentExp.details.push(line.replace(/^[•·▪▫\-\*]\s/, ''));
    }
  }
  
  if (currentExp) {
    experience.push(currentExp);
  }
  
  return experience.length > 0 ? experience : [{
    company: 'Example Company',
    role: 'Professional',
    period: '2020-Present',
    details: ['Demonstrated expertise in various professional areas', 'Contributed to team success and project delivery']
  }];
}

function extractEducationFromText(text: string): Array<{
  school: string;
  degree: string;
  period: string;
}> {
  const education: Array<{
    school: string;
    degree: string;
    period: string;
  }> = [];
  
  // Look for education patterns
  const educationPatterns = [
    /university|college|institute|school/gi,
    /bachelor|master|phd|diploma|certificate/gi
  ];
  
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (educationPatterns.some(pattern => pattern.test(line))) {
      education.push({
        school: line,
        degree: 'Degree',
        period: '2018-2022'
      });
    }
  }
  
  return education.length > 0 ? education : [{
    school: 'University',
    degree: 'Bachelor\'s Degree',
    period: '2018-2022'
  }];
}

function generateDefaultSummary(candidate: Partial<Candidate>): string {
  const experienceCount = candidate.experience?.length || 0;
  const skillsCount = candidate.skills?.length || 0;
  
  if (experienceCount > 0 && skillsCount > 0) {
    return `Experienced professional with ${experienceCount} years of experience and expertise in ${skillsCount} key areas. Demonstrated track record of delivering results and contributing to organizational success.`;
  } else if (experienceCount > 0) {
    return `Professional with ${experienceCount} years of experience in various roles. Committed to continuous learning and professional development.`;
  } else {
    return 'Motivated professional seeking opportunities to apply skills and contribute to organizational success.';
  }
}

function determineSectionOrder(candidate: Partial<Candidate>): string[] {
  const hasSkills = candidate.skills && candidate.skills.length > 0;
  const hasExperience = candidate.experience && candidate.experience.length > 0;
  const hasEducation = candidate.education && candidate.education.length > 0;
  
  if (hasSkills && hasExperience && hasEducation) {
    return ['skills', 'experience', 'education'];
  } else if (hasExperience && hasSkills) {
    return ['experience', 'skills', 'education'];
  } else if (hasSkills && hasEducation) {
    return ['skills', 'education', 'experience'];
  } else {
    return ['experience', 'education', 'skills'];
  }
}

function calculateCulturalFit(candidate: Partial<Candidate>): number {
  let score = 3; // Base score
  
  // Experience factor
  if (candidate.experience && candidate.experience.length > 2) score += 1;
  if (candidate.experience && candidate.experience.length > 5) score += 1;
  
  // Skills diversity
  if (candidate.skills && candidate.skills.length > 5) score += 1;
  if (candidate.skills && candidate.skills.length > 10) score += 1;
  
  // Education factor
  if (candidate.education && candidate.education.length > 0) score += 1;
  
  return Math.min(score, 5);
}

function generateLinkedInQuestions(candidate: Partial<Candidate>): any[] {
  const questions = [
    {
      id: "1",
      question: "What motivates you to work in a global environment?",
      answer: "My passion for innovation and cross-cultural collaboration drives me to work with global firms. I believe technology can bridge cultural gaps and create meaningful impact worldwide.",
      category: "personal"
    },
    {
      id: "2", 
      question: "How has your upbringing or background shaped your approach to building professional relationships?",
      answer: "Growing up in a diverse community taught me to value different perspectives and communicate effectively across cultural boundaries. This helps me build authentic professional relationships.",
      category: "personal"
    },
    {
      id: "3",
      question: "What's a personal story you'd share on LinkedIn to showcase your journey to working in the US?", 
      answer: "I'd share about my first hackathon where I collaborated with developers from 5 different countries. Despite language barriers, we created an accessibility tool that won first place - showing how diversity fuels innovation.",
      category: "linkedin"
    },
    {
      id: "4",
      question: "How do you define success in your personal and professional life, and how does this align with working at a Big 4 firm?",
      answer: "Success means creating technology that makes a positive impact while continuously learning and growing. Big 4 firms offer the scale and resources to achieve meaningful change globally.",
      category: "linkedin"
    },
    {
      id: "5",
      question: "What personal qualities do you bring to a global team, and how have you developed them through your experiences?",
      answer: "I bring adaptability, empathy, and a growth mindset. Working on open-source projects with international contributors taught me to appreciate different working styles and time zones.",
      category: "linkedin"
    }
  ];
  
  return questions;
}

export async function removePersonalInfo(cvText: string): Promise<string> {
  // If no OpenAI API key, use fallback
  if (!openai) {
    return removePersonalInfoFallback(cvText);
  }

  const prompt = `
Remove or replace all personal information from this CV text while keeping the professional content intact.

Personal information to remove/replace:
- Full names (replace with "[CANDIDATE NAME]")
- Email addresses (replace with "[EMAIL]")
- Phone numbers (replace with "[PHONE]")
- Home addresses (replace with "[ADDRESS]")
- Personal websites/portfolios (replace with "[WEBSITE]")
- LinkedIn profiles (replace with "[LINKEDIN]")
- Personal photos references
- Any other personally identifiable information

Keep all:
- Job titles and roles
- Company names
- Educational institutions
- Skills and technologies
- Work experience descriptions
- Achievements and accomplishments
- Professional certifications
- Industry-specific terms

Return the cleaned CV text:

${cvText}
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a privacy-focused assistant that removes personal information while preserving professional content. Return only the cleaned text without any explanations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || cvText;
  } catch (error) {
    console.error('Error removing personal info:', error);
    return removePersonalInfoFallback(cvText);
  }
}

function removePersonalInfoFallback(cvText: string): string {
  return cvText
    .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[EMAIL]')
    .replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE]')
    .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+(?: [A-Z][a-z]+)?\b/g, '[CANDIDATE NAME]')
    .replace(/linkedin\.com\/in\/[A-Za-z0-9-]+/g, '[LINKEDIN]')
    .replace(/https?:\/\/[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[WEBSITE]');
}

// Enhanced CV analysis function
export async function analyzeCVQuality(cvText: string): Promise<{
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}> {
  // If no OpenAI API key, use fallback
  if (!openai) {
    return analyzeCVQualityFallback(cvText);
  }

  const prompt = `
Analyze this CV/Resume and provide a comprehensive quality assessment.

CV TEXT:
${cvText}

Provide analysis in this JSON format:
{
  "overallScore": 85,
  "strengths": ["Clear structure", "Quantified achievements"],
  "weaknesses": ["Missing summary", "Generic descriptions"],
  "suggestions": ["Add professional summary", "Include specific metrics"]
}

Focus on:
- Content completeness
- Professional presentation
- Achievement quantification
- Skills relevance
- Experience descriptions
- Overall impact

Return only valid JSON:
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a professional CV reviewer. Analyze CVs and provide constructive feedback. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const extractedText = response.choices[0]?.message?.content;
    if (!extractedText) {
      throw new Error('No response from OpenAI');
    }

    const jsonStart = extractedText.indexOf('{');
    const jsonEnd = extractedText.lastIndexOf('}') + 1;
    const jsonString = extractedText.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error analyzing CV quality:', error);
    return analyzeCVQualityFallback(cvText);
  }
}

async function analyzeCVQualityFallback(cvText: string): Promise<{
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}> {
  const structure = await detectDocumentStructure(cvText);
  const contactInfo = await extractContactInfo(cvText);
  
  let score = 70; // Base score
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];
  
  // Analyze based on detected structure
  if (structure.hasContactInfo) {
    score += 10;
    strengths.push('Contact information present');
  } else {
    weaknesses.push('Missing contact information');
    suggestions.push('Add email and phone number');
  }
  
  if (structure.hasExperience) {
    score += 10;
    strengths.push('Work experience included');
  } else {
    weaknesses.push('No work experience found');
    suggestions.push('Include relevant work experience');
  }
  
  if (structure.hasEducation) {
    score += 5;
    strengths.push('Education section present');
  } else {
    weaknesses.push('Education information missing');
    suggestions.push('Add educational background');
  }
  
  if (structure.hasSkills) {
    score += 5;
    strengths.push('Skills section identified');
  } else {
    weaknesses.push('Skills not clearly listed');
    suggestions.push('Add a dedicated skills section');
  }
  
  if (structure.confidence > 80) {
    strengths.push('High document structure confidence');
  }
  
  return {
    overallScore: Math.min(score, 100),
    strengths,
    weaknesses,
    suggestions
  };
}

