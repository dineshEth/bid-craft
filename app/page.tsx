'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LLMProviderName, RFPExtractedData, ProposalData } from '@/lib/llm/types';

// Dynamically import components to avoid SSR issues
const FileUpload = dynamic(() => import('@/components/FileUpload'), {
  ssr: false,
  loading: () => <p className="text-center py-8">Loading upload component...</p>,
});

const ResultsDisplay = dynamic(() => import('@/components/ResultsDisplay'), {
  ssr: false,
  loading: () => <p className="text-center py-8">Loading results...</p>,
});

export default function Home() {
  const [availableProviders, setAvailableProviders] = useState<LLMProviderName[]>([]);
  const [defaultProvider, setDefaultProvider] = useState<LLMProviderName>('mistral');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<RFPExtractedData | null>(null);
  const [proposal, setProposal] = useState<ProposalData | null>(null);
  const [fileMetadata, setFileMetadata] = useState<any>(null);
  const [selectedProvider, setSelectedProvider] = useState<LLMProviderName | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available providers on mount
  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await fetch('/api/upload');
        const data = await response.json();
        
        if (data.success) {
          setAvailableProviders(data.providers.map((p: any) => p.name));
          setDefaultProvider(data.defaultProvider);
        }
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        // Fallback to default providers
        setAvailableProviders(['mistral', 'openai', 'gemini']);
        setDefaultProvider('mistral');
      }
    }
    
    fetchProviders();
  }, []);

  const handleFileUpload = async (file: File, provider: LLMProviderName) => {
    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    setProposal(null);
    setFileMetadata(null);
    setSelectedProvider(provider);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('provider', provider);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setExtractedData(result.extractedData);
        setProposal(result.proposal);
        setFileMetadata(result.fileMetadata);
      } else {
        throw new Error(result.error || 'Processing failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setExtractedData(null);
    setProposal(null);
    setFileMetadata(null);
    setSelectedProvider(null);
    setError(null);
  };

  if (availableProviders.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
        <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
          <p className="text-gray-600">Checking LLM provider configuration...</p>
          <p className="text-sm text-gray-500 mt-4">
            Please ensure you have configured at least one LLM provider in your .env file.
          </p>
        </div>
      </div>
    );
  }

  if (!extractedData && !proposal) {
    return (
      <div className="flex flex-col flex-1 items-center justify-start bg-zinc-50 font-sans dark:bg-black py-16">
        <div className="w-full max-w-4xl px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              RFP to Proposal Generator
            </h1>
            <p className="text-xl text-gray-600">
              Upload your RFP document and generate a professional proposal
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <FileUpload
            onFileUpload={handleFileUpload}
            availableProviders={availableProviders}
            defaultProvider={defaultProvider}
            isLoading={isLoading}
          />

          <div className="mt-8 p-6 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">How It Works</h3>
            <ol className="space-y-2 text-gray-700">
              <li>1. Upload your RFP document (PDF, DOCX, or TXT)</li>
              <li>2. Select an LLM provider (Mistral, OpenAI, or Gemini)</li>
              <li>3. Our AI extracts key information from the RFP</li>
              <li>4. A comprehensive proposal is generated based on the extracted data</li>
            </ol>
            
            <p className="mt-4 text-sm text-gray-600">
              <strong>Supported LLM Providers:</strong> {availableProviders.join(', ')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-zinc-50 font-sans dark:bg-black py-8">
      <div className="w-full max-w-6xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            RFP to Proposal Generator
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <ResultsDisplay
          extractedData={extractedData}
          proposal={proposal}
          fileMetadata={fileMetadata}
          provider={selectedProvider}
          onReset={handleReset}
        />
      </div>
    </div>
  );
}
