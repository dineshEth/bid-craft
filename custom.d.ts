// Custom type declarations for the project

declare module 'pdf-parse' {
  interface PDFParseResult {
    text: string;
    numpages: number;
    info?: {
      Title?: string;
      Author?: string;
      Subject?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
    };
  }

  function pdfParse(buffer: Buffer): Promise<PDFParseResult>;
  
  export = pdfParse;
}

declare module 'mammoth' {
  interface ExtractionResult {
    value: string;
    messages: any[];
  }

  interface Options {
    path?: string;
    buffer?: Buffer;
    // Add other mammoth options as needed
  }

  function extractRawText(options: Options): Promise<ExtractionResult>;
  
  export = extractRawText;
  export function extractRawText(options: Options): Promise<ExtractionResult>;
}
