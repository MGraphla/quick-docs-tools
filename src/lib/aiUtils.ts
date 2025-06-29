// AI utilities for PDF processing

/**
 * Analyzes PDF files using OpenRouter API
 * @param fileNames Array of file names
 * @param totalPages Total number of pages
 * @returns Analysis results including suggested filename, summary, and duplicate detection
 */
export const analyzePdfContent = async (fileNames: string[], totalPages: number): Promise<{
  suggestedFilename: string;
  summary: string;
  duplicatePages: string;
}> => {
  try {
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_OPENROUTER_MODEL || "google/gemini-2.5-flash-lite-preview-06-17";
    
    if (!apiKey) {
      console.error("OpenRouter API key not found");
      return {
        suggestedFilename: "merged-document.pdf",
        summary: "No summary available. API key not configured.",
        duplicatePages: "Unable to detect duplicates. API key not configured."
      };
    }
    
    // Prepare prompt for OpenRouter API
    const prompt = `I have ${fileNames.length} PDF files that I'm merging into one document. The files are named: ${fileNames.join(", ")}. 
    The combined document will have ${totalPages} pages total.
    
    Based on this information, please provide:
    1. A suggested filename for the merged PDF (should be concise but descriptive)
    2. A one-paragraph summary of what this combined document likely contains
    3. Any potential duplicate or repeated pages that might exist (based on the file names and structure)
    
    Format your response as JSON with the following keys: suggestedFilename, summary, duplicatePages`;

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "QuickDocs PDF Tools"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in API response");
    }

    // Parse the JSON response
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (e) {
      // If JSON parsing fails, try to extract structured data from text
      const suggestedFilenameMatch = content.match(/suggestedFilename["\s:]+([^"\n,]+)/i);
      const summaryMatch = content.match(/summary["\s:]+([^"]+?)(?:,|\n|$)/i);
      const duplicatePagesMatch = content.match(/duplicatePages["\s:]+([^"]+?)(?:,|\n|$)/i);
      
      parsedContent = {
        suggestedFilename: suggestedFilenameMatch?.[1]?.trim() || "merged-document.pdf",
        summary: summaryMatch?.[1]?.trim() || "No summary available.",
        duplicatePages: duplicatePagesMatch?.[1]?.trim() || "No duplicates detected."
      };
    }

    return {
      suggestedFilename: parsedContent.suggestedFilename || "merged-document.pdf",
      summary: parsedContent.summary || "No summary available.",
      duplicatePages: parsedContent.duplicatePages || "No duplicates detected."
    };
  } catch (error) {
    console.error("Error analyzing PDF content:", error);
    return {
      suggestedFilename: "merged-document.pdf",
      summary: "Summary unavailable due to an error in the AI service.",
      duplicatePages: "Duplicate detection unavailable due to an error."
    };
  }
};

/**
 * Analyzes PDF content to suggest names for split files
 * @param fileName Original file name
 * @param pageCount Total number of pages
 * @param pageRanges Array of page ranges to split
 * @returns Array of suggested names for each split file
 */
export const suggestSplitFileNames = async (
  fileName: string, 
  pageCount: number,
  pageRanges: Array<{ start: number; end: number }>
): Promise<string[]> => {
  try {
    // Get API key from environment variables
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    const model = import.meta.env.VITE_OPENROUTER_MODEL || "google/gemini-2.5-flash-lite-preview-06-17";
    
    if (!apiKey) {
      console.error("OpenRouter API key not found");
      return pageRanges.map((_, index) => `split-${index + 1}-${fileName}`);
    }
    
    // Prepare prompt for OpenRouter API
    const prompt = `I have a PDF file named "${fileName}" with ${pageCount} total pages.
    I'm splitting it into ${pageRanges.length} separate PDF files with the following page ranges:
    ${pageRanges.map((range, i) => `File ${i+1}: Pages ${range.start}-${range.end}`).join('\n')}
    
    Based on this information, please suggest meaningful names for each split file.
    The names should be descriptive of what each section likely contains based on its position in the document.
    
    For example, instead of "part1.pdf", suggest names like "Chapter 1 - Introduction.pdf" or "Financial Statements.pdf".
    
    Format your response as a JSON array of strings, with one filename suggestion for each split file.`;

    // Call OpenRouter API
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "QuickDocs PDF Tools"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in API response");
    }

    // Parse the JSON response
    let fileNames;
    try {
      const parsedContent = JSON.parse(content);
      fileNames = Array.isArray(parsedContent) ? parsedContent : parsedContent.fileNames;
    } catch (e) {
      console.error("Error parsing API response:", e);
      fileNames = null;
    }

    // If we couldn't get meaningful names, use default naming
    if (!fileNames || !Array.isArray(fileNames) || fileNames.length !== pageRanges.length) {
      return pageRanges.map((_, index) => `split-${index + 1}-${fileName}`);
    }

    // Ensure all filenames end with .pdf
    return fileNames.map(name => {
      if (!name.toLowerCase().endsWith('.pdf')) {
        return `${name}.pdf`;
      }
      return name;
    });
  } catch (error) {
    console.error("Error suggesting split file names:", error);
    return pageRanges.map((_, index) => `split-${index + 1}-${fileName}`);
  }
};