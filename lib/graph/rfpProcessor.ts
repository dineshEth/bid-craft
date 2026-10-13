import { RFPExtractedData, LLMProvider, ProposalData, LLMProviderName } from '../llm/types';
import { getDefaultLLM, getLLM, getAvailableLLMs } from '../llm/factory';
import { FileParseResult } from '../utils/fileParser';

// Prompts for extracting RFP information
export const RFP_EXTRACTION_PROMPT = `
You are an expert RFP (Request for Proposal) analyzer. Extract the following structured information from the provided RFP document:

REQUIRED OUTPUT FORMAT (JSON only, no markdown, no explanations):
{
  "title": "The title or name of the project",
  "summary": "A brief executive summary of the RFP",
  "requirements": ["List of key requirements", "Each as a separate item"],
  "timeline": {
    "startDate": "Project start date if specified",
    "endDate": "Project end date or deadline if specified",
    "duration": "Project duration if specified"
  },
  "budget": "Budget information if available",
  "scope": ["List of scope items", "What the project covers"],
  "stakeholders": ["Key stakeholders mentioned"],
  "deliverables": ["Expected deliverables"],
  "evaluationCriteria": ["Evaluation criteria for proposals"],
  "companyInfo": {
    "name": "Company or organization name",
    "industry": "Industry or sector",
    "location": "Location if mentioned"
  }
}

Rules:
1. Always return valid JSON
2. If information is not available, use null for strings or empty arrays [] for lists
3. Be concise and accurate
4. Extract only what is explicitly mentioned in the document
5. Use the exact terminology from the RFP

RFP Content:
{rfpContent}
`;

// Prompt for generating proposal
export const PROPOSAL_GENERATION_PROMPT = `
You are an expert proposal writer. Based on the extracted RFP information, create a comprehensive proposal.

RFP Information:
{rfpInfo}

Generate a detailed proposal with the following structure (JSON only):
{
  "projectTitle": "Proposed project title",
  "executiveSummary": "High-level overview of the proposal (2-3 paragraphs)",
  "problemStatement": "Clear description of the problem being addressed",
  "proposedSolution": "Detailed description of your proposed solution",
  "methodology": "How you will implement the solution",
  "timeline": {
    "startDate": "Proposed start date",
    "endDate": "Proposed completion date",
    "milestones": [
      {"phase": "Phase 1", "date": "YYYY-MM-DD", "description": "Phase description"},
      {"phase": "Phase 2", "date": "YYYY-MM-DD", "description": "Phase description"}
    ]
  },
  "budget": {
    "total": "Total project cost",
    "breakdown": [
      {"item": "Development", "cost": "Cost amount"},
      {"item": "Testing", "cost": "Cost amount"}
    ]
  },
  "team": {
    "members": [
      {"name": "Team member name", "role": "Role", "experience": "Relevant experience"}
    ]
  },
  "deliverables": ["List of deliverables"],
  "evaluationCriteria": ["How your proposal meets evaluation criteria"],
  "companyInfo": {
    "name": "Your company name",
    "about": "About your company",
    "experience": "Relevant company experience",
    "contact": "Contact information"
  }
}

Rules:
1. Always return valid JSON
2. Be professional, detailed, and persuasive
3. Address all RFP requirements
4. Propose realistic timelines and budgets
5. Highlight relevant experience and capabilities
`;

/**
 * Extract structured data from RFP content using LLM
 */
export async function extractRFPData(
  fileParseResult: FileParseResult,
  providerName?: LLMProviderName
): Promise<RFPExtractedData> {
  try {
    const llm = providerName ? getLLM(providerName) : getDefaultLLM();
    
    const prompt = RFP_EXTRACTION_PROMPT.replace(
      '{rfpContent}',
      `\n\n--- RFP CONTENT BEGINS ---\n${fileParseResult.content}\n--- RFP CONTENT ENDS ---\n`
    );
    
    const response = await llm.invoke(prompt, {
      temperature: 0.3, // Lower temperature for more deterministic extraction
    });
    
    // Parse the JSON response
    const jsonResponse = parseLLMResponse(response);
    
    return {
      ...jsonResponse,
      rawContent: fileParseResult.content,
    };
  } catch (error) {
    console.error('Error extracting RFP data:', error);
    throw new Error(`Failed to extract RFP data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Generate a proposal from extracted RFP data using LLM
 */
export async function generateProposal(
  rfpData: RFPExtractedData,
  providerName?: LLMProviderName
): Promise<ProposalData> {
  try {
    const llm = providerName ? getLLM(providerName) : getDefaultLLM();
    
    const rfpInfo = JSON.stringify(rfpData, null, 2);
    const prompt = PROPOSAL_GENERATION_PROMPT.replace('{rfpInfo}', rfpInfo);
    
    const response = await llm.invoke(prompt, {
      temperature: 0.7, // Higher temperature for more creative proposals
    });
    
    // Parse the JSON response
    const proposalData = parseLLMResponse(response) as ProposalData;
    
    return proposalData;
  } catch (error) {
    console.error('Error generating proposal:', error);
    throw new Error(`Failed to generate proposal: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Process a file through the full pipeline: parse -> extract -> generate
 */
export async function processRFPPipeline(
  fileBuffer: Buffer,
  fileName: string,
  providerName?: LLMProviderName
): Promise<{
  fileMetadata: FileParseResult['metadata'];
  extractedData: RFPExtractedData;
  proposal: ProposalData;
}> {
  // Step 1: Parse the file
  const { parseFile } = await import('../utils/fileParser');
  const fileParseResult = await parseFile(fileBuffer, fileName);
  
  // Step 2: Extract RFP data
  const extractedData = await extractRFPData(fileParseResult, providerName);
  
  // Step 3: Generate proposal
  const proposal = await generateProposal(extractedData, providerName);
  
  return {
    fileMetadata: fileParseResult.metadata,
    extractedData,
    proposal,
  };
}

/**
 * Helper function to parse LLM response and extract JSON
 */
function parseLLMResponse(response: string): any {
  try {
    // Try to parse as JSON directly
    return JSON.parse(response);
  } catch (jsonError) {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        // Fallback: return the raw response
        console.warn('Could not parse LLM response as JSON', innerError);
        return { rawResponse: response };
      }
    }
    
    // Fallback: return the raw response
    console.warn('Could not parse LLM response as JSON');
    return { rawResponse: response };
  }
}

/**
 * Stream the proposal generation for real-time updates
 */
export async function* streamProposalGeneration(
  rfpData: RFPExtractedData,
  providerName?: LLMProviderName
): AsyncGenerator<string> {
  try {
    const llm = providerName ? getLLM(providerName) : getDefaultLLM();
    
    const rfpInfo = JSON.stringify(rfpData, null, 2);
    const prompt = PROPOSAL_GENERATION_PROMPT.replace('{rfpInfo}', rfpInfo);
    
    const stream = await llm.stream(prompt, {
      temperature: 0.7,
    });
    
    for await (const chunk of stream) {
      yield chunk;
    }
  } catch (error) {
    console.error('Error streaming proposal generation:', error);
    throw new Error(`Failed to stream proposal generation: ${error instanceof Error ? error.message : String(error)}`);
  }
}
