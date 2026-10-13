import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { getAvailableLLMs, getDefaultLLM, LLMFactory } from '@/lib/llm';
import { validateFile } from '@/lib/utils/fileParser';
import { runSimpleWorkflow } from '@/lib/graph';
import { LLMProviderName } from '@/lib/llm/types';

// Upload endpoint for processing RFP documents
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const providerName = formData.get('provider') as LLMProviderName | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Validate file size and type
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const validation = validateFile(fileBuffer, 50 * 1024 * 1024); // 50MB max
    
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    // Get the selected provider or use default
    const availableLLMs = getAvailableLLMs();
    let selectedProvider: LLMProviderName = availableLLMs[0];
    
    if (providerName && availableLLMs.includes(providerName)) {
      selectedProvider = providerName;
    }
    
    // Process the file through the workflow
    const workflowResult = await runSimpleWorkflow(fileBuffer, file.name, selectedProvider);
    
    if (workflowResult.error) {
      return NextResponse.json(
        { error: workflowResult.error },
        { status: 500 }
      );
    }
    
    // Generate a unique ID for this processing job
    const jobId = generateJobId();
    
    return NextResponse.json({
      success: true,
      jobId,
      fileMetadata: workflowResult.fileMetadata,
      extractedData: workflowResult.extractedData,
      proposal: workflowResult.proposal,
      provider: selectedProvider,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: `Processing failed: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

// Get available LLM providers
export async function GET() {
  try {
    const availableLLMs = getAvailableLLMs();
    const config = LLMFactory.getInstance().getConfig();
    
    const providers = availableLLMs.map(provider => ({
      name: provider,
      model: config[provider].model,
      isDefault: provider === config.defaultProvider,
    }));
    
    return NextResponse.json({
      success: true,
      providers,
      defaultProvider: config.defaultProvider,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get providers: ${error}` },
      { status: 500 }
    );
  }
}

// Generate a unique job ID
function generateJobId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2);
  return `rfp_${timestamp}_${random}`;
}
