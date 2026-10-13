# RFP to Proposal Generator

A Next.js application that converts Request for Proposal (RFP) documents into professional proposals using AI. Supports multiple LLM providers (Mistral, OpenAI, Google Gemini) and can parse PDF, DOCX, and TXT files.

## Features

- **Multi-LLM Support**: Switch between Mistral, OpenAI (GPT), and Google Gemini
- **Document Parsing**: Upload and parse PDF, DOCX, and TXT files
- **Automated RFP Analysis**: Extract structured data from RFP documents
- **AI-Powered Proposal Generation**: Generate comprehensive proposals based on RFP requirements
- **Modern UI**: Drag-and-drop file upload with real-time feedback

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for at least one LLM provider

### Installation

1. Clone the repository:
```bash
cd /home/dinesh/src/rfpt-to-praposal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on the example:
```bash
cp .env.example .env
```

4. Configure your LLM provider API keys in `.env`:
```env
# Mistral AI Configuration
MISTRAL_ACTIVE=true
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-large-latest

# OpenAI Configuration
OPENAI_ACTIVE=true
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Google Gemini Configuration
GEMINI_ACTIVE=true
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Default LLM Provider
DEFAULT_LLM_PROVIDER=mistral
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### LLM Providers

The application supports three LLM providers:
- **Mistral AI**: Fast, open-source models
- **OpenAI**: GPT-4 and other models
- **Google Gemini**: Google's latest AI models

To enable a provider:
1. Set `PROVIDER_ACTIVE=true` in `.env`
2. Add your API key for that provider
3. Set the model name you want to use

Only providers with `ACTIVE=true` and a valid API key will be available for selection.

### Default Provider

Set `DEFAULT_LLM_PROVIDER` in `.env` to specify which provider should be selected by default.

## Usage

1. Upload RFP Document: Drag and drop or click to select a PDF, DOCX, or TXT file
2. Select LLM Provider: Choose from available providers
3. Generate Proposal: Click "Generate Proposal" to process the document
4. Review Results: View extracted RFP data and the generated proposal

## Project Structure

```
rfpt-to-praposal/
├── app/
│   ├── api/
│   │   ├── upload/route.ts      # File upload and processing API
│   │   └── process/route.ts      # Streaming processing API
│   ├── page.tsx                 # Main page component
│   └── layout.tsx               # Layout component
├── components/
│   ├── FileUpload.tsx           # File upload component
│   ├── ResultsDisplay.tsx       # Results display component
│   └── index.ts                 # Component exports
├── lib/
│   ├── llm/
│   │   ├── types.ts             # Type definitions
│   │   ├── config.ts            # LLM configuration loader
│   │   ├── factory.ts            # LLM factory
│   │   ├── providers/
│   │   │   ├── mistral.ts       # Mistral provider
│   │   │   ├── openai.ts        # OpenAI provider
│   │   │   └── gemini.ts        # Gemini provider
│   │   └── index.ts             # LLM module exports
│   ├── utils/
│   │   └── fileParser.ts        # File parsing utilities
│   ├── graph/
│   │   ├── rfpProcessor.ts      # RFP processing logic
│   │   └── workflow.ts          # Workflow utilities
│   └── index.ts                 # Library exports
├── .env.example                 # Environment configuration template
└── package.json
```

## API Endpoints

### POST /api/upload

Upload and process an RFP document.

**Request:**
- `file`: The document file (PDF, DOCX, TXT)
- `provider`: Optional LLM provider name

**Response:** Returns extracted data and generated proposal as JSON

### GET /api/upload

Get available LLM providers.

**Response:** Returns list of available providers

## Technologies

- Next.js 16
- TypeScript
- LangChain
- LangGraph
- Tailwind CSS
- pdf-parse
- mammoth

## License

MIT License
