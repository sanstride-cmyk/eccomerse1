import { ContentSection } from "@/components/ContentSection";
import { ProductForm } from "@/components/ProductForm";
import { useProductGeneration } from "@/hooks/use-product-generation";
import { 
  Type, 
  Target, 
  FileText, 
  CheckCircle2, 
  Megaphone, 
  Video, 
  Tags, 
  Image as ImageIcon,
  IndianRupee,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { generate, isGenerating, content, error, progress } = useProductGeneration();

  const hasContent = Object.keys(content).length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl leading-none">DropConvert</h1>
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary">Pro Tools</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form */}
          <div className="lg:col-span-4 transition-all duration-500 ease-in-out">
            <ProductForm 
              onSubmit={generate} 
              isGenerating={isGenerating} 
              progress={progress}
            />
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {!hasContent && !isGenerating && !error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 rounded-3xl border-2 border-dashed border-border/50 bg-secondary/20"
                >
                  <img 
                    src={`${import.meta.env.BASE_URL}images/empty-state.png`} 
                    alt="Empty state illustration" 
                    className="w-64 h-64 object-contain mb-6 drop-shadow-xl animate-float"
                    style={{ animation: 'float 6s ease-in-out infinite' }}
                  />
                  <h3 className="text-2xl font-display font-bold text-foreground mb-2">Ready to Boost Sales?</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a product image URL and details to instantly generate a complete, high-converting marketing package tailored for Indian buyers.
                  </p>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border-l-4 border-destructive text-destructive p-6 rounded-xl shadow-sm"
                >
                  <h3 className="font-bold text-lg mb-1">Generation Failed</h3>
                  <p>{error}</p>
                </motion.div>
              )}

              {(hasContent || isGenerating) && (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                    <div>
                      <h3 className="font-bold text-foreground">Generated Package</h3>
                      <p className="text-sm text-muted-foreground">Tailored for maximum conversion</p>
                    </div>
                    {isGenerating && (
                      <span className="flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Generating...
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Render sections dynamically as they arrive */}
                    {content.names && (
                      <ContentSection 
                        title="Product Names" 
                        content={content.names} 
                        icon={<Type className="w-5 h-5" />} 
                        className="md:col-span-2"
                      />
                    )}
                    
                    {content.hooks && (
                      <ContentSection 
                        title="Scroll-Stopping Hooks" 
                        content={content.hooks} 
                        icon={<Target className="w-5 h-5" />} 
                      />
                    )}
                    
                    {content.pricing && (
                      <ContentSection 
                        title="Pricing Strategy" 
                        content={content.pricing} 
                        icon={<IndianRupee className="w-5 h-5" />} 
                      />
                    )}

                    {content.description && (
                      <ContentSection 
                        title="Product Description" 
                        content={content.description} 
                        icon={<FileText className="w-5 h-5" />} 
                        className="md:col-span-2"
                      />
                    )}

                    {content.benefits && (
                      <ContentSection 
                        title="Key Benefits" 
                        content={content.benefits} 
                        icon={<CheckCircle2 className="w-5 h-5" />} 
                      />
                    )}

                    {content.tags && (
                      <ContentSection 
                        title="Shopify SEO Tags" 
                        content={content.tags} 
                        icon={<Tags className="w-5 h-5" />} 
                      />
                    )}

                    {content.adCopy && (
                      <ContentSection 
                        title="Ad Copy Variations" 
                        content={content.adCopy} 
                        icon={<Megaphone className="w-5 h-5" />} 
                        className="md:col-span-2"
                      />
                    )}

                    {content.videoScript && (
                      <ContentSection 
                        title="Video Script (Reels/Shorts)" 
                        content={content.videoScript} 
                        icon={<Video className="w-5 h-5" />} 
                        className="md:col-span-2"
                      />
                    )}

                    {content.imageIdeas && (
                      <ContentSection 
                        title="Creative Image Ideas" 
                        content={content.imageIdeas} 
                        icon={<ImageIcon className="w-5 h-5" />} 
                        className="md:col-span-2"
                      />
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>
      
      {/* Global styles for floating animation used in empty state */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}
