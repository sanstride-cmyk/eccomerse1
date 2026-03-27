import { useState, useRef } from "react";
import { z } from "zod";

// Ensure this matches the sections the AI generates
export type GeneratedContent = {
  names?: string;
  hooks?: string;
  description?: string;
  benefits?: string;
  adCopy?: string;
  videoScript?: string;
  pricing?: string;
  tags?: string;
  imageIdeas?: string;
};

type GenerateState = {
  isGenerating: boolean;
  content: GeneratedContent;
  error: string | null;
  progress: number;
};

const SSEChunkSchema = z.object({
  section: z.string().optional(),
  content: z.string().optional(),
  done: z.boolean().optional(),
  error: z.string().optional(),
});

export function useProductGeneration() {
  const [state, setState] = useState<GenerateState>({
    isGenerating: false,
    content: {},
    error: null,
    progress: 0,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const generate = async (params: { imageUrl: string; productCategory?: string; additionalInfo?: string }) => {
    // Reset state
    setState({
      isGenerating: true,
      content: {},
      error: null,
      progress: 5, // Start with a small progress
    });

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/product/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        let errorMsg = "Failed to generate content";
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch (e) {
          // ignore parsing error
        }
        throw new Error(errorMsg);
      }

      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      
      // We expect 9 sections, so we increment progress accordingly
      let sectionsReceived = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || ""; // Keep incomplete chunk in buffer

        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.startsWith("data: ")) {
            try {
              const dataStr = line.slice(6).trim();
              if (dataStr === "[DONE]") {
                 setState(prev => ({ ...prev, isGenerating: false, progress: 100 }));
                 continue;
              }

              const parsed = SSEChunkSchema.parse(JSON.parse(dataStr));

              if (parsed.error) {
                throw new Error(parsed.error);
              }

              if (parsed.done) {
                setState(prev => ({ ...prev, isGenerating: false, progress: 100 }));
                break;
              }

              if (parsed.section && parsed.content) {
                sectionsReceived++;
                setState(prev => {
                  // Append content if section already exists, otherwise set it
                  const currentSectionContent = prev.content[parsed.section as keyof GeneratedContent] || "";
                  return {
                    ...prev,
                    content: {
                      ...prev.content,
                      [parsed.section as keyof GeneratedContent]: currentSectionContent + parsed.content
                    },
                    // Rough progress calculation
                    progress: Math.min(15 + (sectionsReceived * 8), 95)
                  };
                });
              }
            } catch (err) {
              console.error("Error parsing SSE chunk:", err, line);
            }
          }
        }
      }
      
      // Ensure we finish cleanly if stream ends without explicit [DONE] event
      setState(prev => ({ ...prev, isGenerating: false, progress: 100 }));

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Generation aborted');
      } else {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          error: error.message || "An unexpected error occurred",
          progress: 0
        }));
      }
    }
  };

  const stop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setState(prev => ({ ...prev, isGenerating: false }));
    }
  };

  return {
    ...state,
    generate,
    stop,
  };
}
