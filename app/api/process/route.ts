import { NextResponse } from 'next/server';
import { getAvailableLLMs, getLLM } from '@/lib/llm';
import { parseFile, validateFile } from '@/lib/utils/fileParser';
import { extractRFPData, generateProposal, streamProposalGeneration } from '@/lib/graph';
import { LLMProviderName, RFPExtractedData } from '@/lib/llm/types';

// Streaming endpoint for processing RFP documents
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const providerName = formData.get('provider') as LLMProviderName | null;
    const streamResponse = formData.get('stream') === 'true';
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Validate file
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const validation = validateFile(fileBuffer, 50 * 1024 * 1024);
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Get the selected provider
    const availableLLMs = getAvailableLLMs();
    let selectedProvider: LLMProviderName = availableLLMs[0];
    
    if (providerName && availableLLMs.includes(providerName)) {
      selectedProvider = providerName;
    }
    
    // Parse the file first
    const fileParseResult = await parseFile(fileBuffer, file.name);
    
    // Extract RFP data
    const extractedData = await extractRFPData(fileParseResult, selectedProvider);
    
    if (streamResponse) {
      // Create a transform stream for the proposal generation
      const proposalStream = new TransformStream({
        async transform(chunk, controller) {
          controller.enqueue(chunk);
        },
      });
      
      // Stream the proposal generation
      const generator = streamProposalGeneration(extractedData, selectedProvider);
      
      const writer = proposalStream.writable.getWriter();
      
      // Write the extracted data first as JSON
      await writer.write(`data: ${JSON.stringify({
        type: 'extracted',
        data: extractedData,
      })}\n\n`);
      
      // Stream the proposal generation
      for await (const chunk of generator) {
        await writer.write(`data: ${JSON.stringify({
          type: 'proposal_chunk',
          data: chunk,
        })}\n\n`);
      }
      
      await writer.write(`data: ${JSON.stringify({
        type: 'complete',
      })}\n\n`);
      
      await writer.close();
      
      return new NextResponse(proposalStream.readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    } else {
      // Non-streaming: generate the full proposal
      const proposal = await generateProposal(extractedData, selectedProvider);
      
      return NextResponse.json({
        success: true,
        fileMetadata: fileParseResult.metadata,
        extractedData,
        proposal,
        provider: selectedProvider,
      });
    }
  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json(
      { error: `Processing failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Get processing status
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');
  
  if (!jobId) {
    return NextResponse.json(
      { error: 'jobId parameter is required' },
      { status: 400 }
    );
  }
  
  // In a real implementation, you would look up the job status
  // For now, we'll return a placeholder response
  return NextResponse.json({
    jobId,
    status: 'completed', // or 'processing', 'error'
    progress: 100,
    result: null, // Would contain the result if completed
  });
}
