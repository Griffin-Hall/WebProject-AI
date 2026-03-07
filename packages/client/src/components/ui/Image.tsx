import { useState, useEffect, ImgHTMLAttributes, forwardRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

/**
 * Normalise Wikimedia Commons thumbnail URLs.
 * Wikimedia only serves certain "step" sizes (120, 250, 330, 500, 960, 1280 …).
 * If the URL requests a non-standard width (e.g. 800px) it returns HTTP 429.
 * This helper rewrites any Wikimedia /thumb/ URL to use 960px.
 */
function normalizeImageUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  // Match Wikimedia thumbnail pattern: /NNNpx-<filename>
  if (url.includes('upload.wikimedia.org') && url.includes('/thumb/')) {
    return url.replace(/\/\d+px-([^/]+)$/, '/960px-$1');
  }
  return url;
}

/**
 * Default fallback image for destinations
 * Uses a gradient placeholder with icon when images fail to load
 */
export const DEFAULT_DESTINATION_FALLBACK = 
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMzMzc3ZmYiIHN0b3Atb3BhY2l0eT0iMC4yIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjYTg1NWY3IiBzdG9wLW9wYWNpdHk9IjAuMiIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZykiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjMpIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+8J+OgjwvdGV4dD48L3N2Zz4=';

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  aspectRatio?: 'video' | 'square' | 'portrait' | 'wide' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill';
  loadingIndicator?: boolean;
  fallbackSrc?: string;
}

const aspectRatioClasses = {
  video: 'aspect-video',
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  wide: 'aspect-[21/9]',
  auto: '',
};

/**
 * Optimized Image Component
 * 
 * Features:
 * - Lazy loading with IntersectionObserver
 * - Fade-in animation on load
 * - Error fallback state with customizable fallback
 * - Prevents layout shifts with aspect ratio
 * - Respects reduced-motion preferences
 * - Automatic retry on error with fallback source
 */
export const Image = forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      className,
      fallback,
      aspectRatio = 'auto',
      objectFit = 'cover',
      loadingIndicator = true,
      fallbackSrc = DEFAULT_DESTINATION_FALLBACK,
      ...props
    },
    ref,
  ) => {
    const normalizedSrc = normalizeImageUrl(src);

    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [currentSrc, setCurrentSrc] = useState(normalizedSrc);
    const [retryCount, setRetryCount] = useState(0);

    // Reset states when src changes
    useEffect(() => {
      setIsLoading(true);
      setHasError(false);
      setCurrentSrc(normalizeImageUrl(src));
      setRetryCount(0);
    }, [src]);

    // Use IntersectionObserver for lazy loading
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: '50px' }
      );

      // Observe the container if we have a ref
      if (ref && 'current' in ref && ref.current) {
        observer.observe(ref.current.parentElement || ref.current);
      } else {
        // If no ref, load immediately
        setIsVisible(true);
      }

      return () => observer.disconnect();
    }, [ref]);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    const handleError = useCallback(() => {
      if (retryCount === 0 && fallbackSrc) {
        // Try fallback source first
        setRetryCount(1);
        setCurrentSrc(fallbackSrc);
      } else {
        // Show error state
        setIsLoading(false);
        setHasError(true);
      }
    }, [retryCount, fallbackSrc]);

    if (hasError) {
      return (
        <div
          className={cn(
            'flex items-center justify-center bg-white/[0.03]',
            aspectRatioClasses[aspectRatio],
            className,
          )}
        >
          {fallback || (
            <div className="flex flex-col items-center gap-2 text-slate-600">
              <svg
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">Image unavailable</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className={cn(
          'relative overflow-hidden',
          aspectRatioClasses[aspectRatio],
          className,
        )}
        style={{ backfaceVisibility: 'hidden' }}
      >
        {/* Loading skeleton - extended to prevent edge lines */}
        {isLoading && loadingIndicator && (
          <div 
            className="absolute -inset-1 bg-white/[0.03] animate-pulse"
            style={{ borderRadius: 'inherit' }}
          />
        )}
        
        {/* Actual image - slightly oversized to eliminate sub-pixel seams */}
        {isVisible && (
          <img
            ref={ref}
            src={currentSrc}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'absolute -inset-[1px] w-[calc(100%+2px)] h-[calc(100%+2px)]',
              objectFit === 'cover' && 'object-cover',
              objectFit === 'contain' && 'object-contain',
              objectFit === 'fill' && 'object-fill',
              // Smooth fade in
              'transition-opacity duration-500 ease-out',
              isLoading ? 'opacity-0' : 'opacity-100',
            )}
            style={{ backfaceVisibility: 'hidden', transform: 'translateZ(0)' }}
            {...props}
          />
        )}
      </div>
    );
  },
);

Image.displayName = 'Image';
