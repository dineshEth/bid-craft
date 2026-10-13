import { RFPExtractedData, ProposalData, LLMProviderName } from '../llm/types';
import { FileParseResult } from '../utils/fileParser';

// Simple workflow runner without graph complexity
export async function runSimpleWorkflow(
  fileBuffer: Buffer,
  fileName: string,
  providerName?: LLMProviderName
): Promise<{
  fileMetadata: FileParseResult['metadata'] | null;
  rfpContent: string | null;
  extractedData: RFPExtractedData | null;
  proposal: ProposalData | null;
  error: string | null;
  currentStep: 'parsing' | 'extracting' | 'generating' | 'completed' | 'error';
  provider: LLMProviderName | null;
}> {
  const { parseFile } = await import('../utils/fileParser');
  const { extractRFPData, generateProposal } = await import('./rfpProcessor');
  
  try {
    // Step 1: Parse file
    const fileParseResult = await parseFile(fileBuffer, fileName);
    
    // Step 2: Extract RFP data
    const extractedData = await extractRFPData(fileParseResult, providerName);
    
    // Step 3: Generate proposal
    const proposal = await generateProposal(extractedData, providerName);
    
    return {
      fileMetadata: fileParseResult.metadata,
      rfpContent: fileParseResult.content,
      extractedData,
      proposal,
      error: null,
      currentStep: 'completed',
      provider: providerName || null,
    };
  } catch (error) {
    return {
      fileMetadata: null,
      rfpContent: null,
      extractedData: null,
      proposal: null,
      error: `Workflow error: ${error}`,
      currentStep: 'error',
      provider: providerName || null,
    };
  }
}
