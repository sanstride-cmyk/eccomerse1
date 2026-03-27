import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ContentSectionProps {
  title: string;
  content?: string;
  icon: React.ReactNode;
  delay?: number;
  className?: string;
}

export function ContentSection({ title, content, icon, delay = 0, className }: ContentSectionProps) {
  const [copied, setCopied] = useState(false);

  if (!content) return null;

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "bg-card rounded-2xl p-6 shadow-sm border border-border/60 hover:shadow-md transition-shadow duration-300 relative group overflow-hidden",
        className
      )}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary/80 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 text-primary rounded-xl">
            {icon}
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {title}
          </h3>
        </div>
        
        <button
          onClick={handleCopy}
          className={cn(
            "p-2 rounded-xl transition-all duration-200 flex items-center gap-2 text-sm font-medium",
            copied 
              ? "bg-green-100 text-green-700 hover:bg-green-200" 
              : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
          )}
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      <div className="prose prose-sm sm:prose-base max-w-none text-muted-foreground prose-p:leading-relaxed prose-headings:text-foreground prose-strong:text-foreground prose-ul:my-2 custom-scrollbar max-h-[400px] overflow-y-auto pr-2">
        {/* Simple rendering for plain text with line breaks */}
        {content.split('\n').map((line, i) => {
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <li key={i} className="ml-4 list-disc marker:text-primary/50">
                {line.substring(2)}
              </li>
            );
          }
          if (line.match(/^\d+\./)) {
             return (
              <div key={i} className="font-medium text-foreground mt-3 mb-1">
                {line}
              </div>
            );
          }
          if (line.trim() === '') {
            return <div key={i} className="h-2" />;
          }
          return <p key={i} className="my-1">{line}</p>;
        })}
      </div>
    </motion.div>
  );
}
