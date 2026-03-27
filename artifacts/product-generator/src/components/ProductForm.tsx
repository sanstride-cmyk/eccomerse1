import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Link as LinkIcon, Tag, AlignLeft, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const formSchema = z.object({
  imageUrl: z.string().url("Please enter a valid image URL"),
  productCategory: z.string().optional(),
  additionalInfo: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  onSubmit: (data: FormValues) => void;
  isGenerating: boolean;
  progress: number;
}

export function ProductForm({ onSubmit, isGenerating, progress }: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      imageUrl: "",
      productCategory: "",
      additionalInfo: "",
    },
  });

  const watchImageUrl = watch("imageUrl");

  // Debounce image preview update
  useState(() => {
    const timer = setTimeout(() => {
      if (watchImageUrl && watchImageUrl.startsWith("http")) {
        setImagePreview(watchImageUrl);
        setImageError(false);
      } else {
        setImagePreview(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [watchImageUrl]);

  return (
    <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 border border-border/50 sticky top-8">
      <div className="mb-8">
        <h2 className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">
          Conversion Setup
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Provide your product details to generate a high-converting package for the Indian market.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-primary" />
            Product Image URL <span className="text-destructive">*</span>
          </label>
          <input
            {...register("imageUrl")}
            type="url"
            placeholder="https://example.com/product.jpg"
            className={cn(
              "w-full px-4 py-3 rounded-xl bg-secondary/50 border-2 transition-all duration-200",
              "focus:outline-none focus:bg-background",
              errors.imageUrl 
                ? "border-destructive/50 focus:border-destructive focus:ring-4 focus:ring-destructive/10" 
                : "border-transparent focus:border-primary focus:ring-4 focus:ring-primary/10"
            )}
            disabled={isGenerating}
          />
          {errors.imageUrl && (
            <p className="text-destructive text-sm font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3 h-3" /> {errors.imageUrl.message}
            </p>
          )}
        </div>

        {/* Image Preview Area */}
        <AnimatePresence>
          {imagePreview && !errors.imageUrl && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-xl bg-secondary/30 border border-border"
            >
              <div className="relative aspect-video flex items-center justify-center overflow-hidden">
                {imageError ? (
                  <div className="text-muted-foreground flex flex-col items-center gap-2 p-4 text-center">
                    <AlertCircle className="w-8 h-8 opacity-50" />
                    <span className="text-sm font-medium">Failed to load preview</span>
                  </div>
                ) : (
                  <img
                    src={imagePreview}
                    alt="Product Preview"
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            Product Category <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
          </label>
          <input
            {...register("productCategory")}
            placeholder="e.g. Smartwatches, Kitchen Gadgets"
            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border-2 border-transparent focus:outline-none focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            disabled={isGenerating}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-primary" />
            Additional Context <span className="text-muted-foreground font-normal text-xs">(Optional)</span>
          </label>
          <textarea
            {...register("additionalInfo")}
            placeholder="Any specific features, target audience pain points, or brand guidelines..."
            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border-2 border-transparent focus:outline-none focus:bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none h-28 custom-scrollbar"
            disabled={isGenerating}
          />
        </div>

        <button
          type="submit"
          disabled={isGenerating || !!errors.imageUrl}
          className={cn(
            "w-full py-4 px-6 rounded-xl font-display font-bold text-lg text-white shadow-lg transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden",
            isGenerating 
              ? "bg-primary/80 cursor-not-allowed transform-none" 
              : "bg-gradient-to-r from-primary to-orange-500 shadow-primary/25 hover:shadow-primary/40 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          )}
        >
          {isGenerating && (
            <div 
              className="absolute inset-0 bg-black/10 transition-all duration-300"
              style={{ width: `${progress}%`, transition: 'width 0.5s ease-out' }}
            />
          )}
          
          <span className="relative z-10 flex items-center gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Package... {progress}%
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Conversion Package
              </>
            )}
          </span>
        </button>
      </form>
    </div>
  );
}
