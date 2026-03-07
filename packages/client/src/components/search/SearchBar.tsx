import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  variant?: 'hero' | 'compact';
  defaultValue?: string;
  onSearch?: (query: string) => void;
}

export function SearchBar({ variant = 'hero', defaultValue = '', onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isHero = variant === 'hero';

  return (
    <form onSubmit={handleSubmit} className="w-full group">
      <div
        className={cn(
          'relative flex items-center rounded-2xl transition-all duration-300',
          isHero
            ? 'bg-white/95 backdrop-blur-xl shadow-2xl shadow-black/10 ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-aurora/30 focus-within:shadow-aurora/10'
            : 'bg-white dark:bg-night-light shadow-lg border border-gray-200 dark:border-white/10 focus-within:border-aurora/30 focus-within:ring-2 focus-within:ring-aurora/20',
        )}
      >
        <div className="flex items-center pl-5">
          <Sparkles
            className={cn(
              'h-5 w-5 transition-colors duration-300',
              isHero ? 'text-voyage-500 group-focus-within:text-aurora' : 'text-gray-400 group-focus-within:text-aurora',
            )}
          />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Where do you dream of going?"
          className={cn(
            'flex-1 bg-transparent border-none outline-none',
            'text-gray-900 dark:text-white placeholder:text-gray-400',
            isHero ? 'px-4 py-5 text-lg' : 'px-4 py-3.5 text-base',
          )}
        />
        <div className="pr-2">
          <button
            type="submit"
            disabled={!query.trim()}
            className={cn(
              'flex items-center gap-2 rounded-xl font-semibold transition-all duration-200',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'active:scale-95',
              isHero
                ? 'gradient-ai text-white px-6 py-3 shadow-lg shadow-aurora/20 hover:shadow-xl hover:shadow-aurora/30'
                : 'gradient-ai text-white px-4 py-2.5 hover:shadow-lg hover:shadow-aurora/20',
            )}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </form>
  );
}
