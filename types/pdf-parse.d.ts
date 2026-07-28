declare module 'pdf-parse' {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }
  
  function pdfParse(data: Buffer): Promise<PDFParseResult>;
  
  export default pdfParse;
}

declare module 'pdf-parse-fork' {
  interface PDFParseResult {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }
  
  function pdfParse(data: Buffer): Promise<PDFParseResult>;
  
  export default pdfParse;
}