import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, User, Loader2, Lightbulb, Calendar, Utensils, Compass, Key } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { useAIConfig, getAIHeaders, PROVIDER_LABELS } from '@/hooks/useAIConfig';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface CityAIAssistantProps {
  city: string;
  country: string;
  continent?: string;
  tags?: string[];
  safetyScore?: number;
  dailyBudgetMid?: number;
  className?: string;
}

const QUICK_PROMPTS = [
  { icon: Compass, label: 'Top attractions', prompt: 'What are the must-see attractions?' },
  { icon: Utensils, label: 'Local food', prompt: 'What local food should I try?' },
  { icon: Calendar, label: 'Best time', prompt: 'When is the best time to visit?' },
  { icon: Lightbulb, label: 'Hidden gems', prompt: 'Any hidden gems or local secrets?' },
];

/**
 * DEMO MODE: Simulated AI Responses (used when no API key is configured)
 */
async function* generateDemoResponse(city: string, country: string, userMessage: string): AsyncGenerator<string> {
  const responses: Record<string, string> = {
    'What are the must-see attractions?': `In ${city}, you absolutely cannot miss the iconic landmarks that define this amazing destination. I'd recommend starting with the historic city center, visiting the main cultural museums, and taking a walking tour to discover the local architecture. Don't forget to check out the viewpoint for panoramic views of ${city}!`,
    'What local food should I try?': `${city} is famous for its incredible culinary scene! You must try the local street food, traditional restaurants in the old town, and the famous dessert that originated here. The night markets also offer amazing authentic experiences with dishes you won't find anywhere else.`,
    'When is the best time to visit?': `The best time to visit ${city}, ${country} depends on your preferences. Spring (March-May) offers mild weather and blooming landscapes. Summer is great for outdoor activities but can be crowded. Autumn brings beautiful colors, while winter offers unique cultural experiences and fewer tourists.`,
    'Any hidden gems or local secrets?': `Beyond the tourist spots, ${city} has some incredible hidden gems! Check out the local neighborhoods where residents hang out, the lesser-known viewpoint at sunrise, the secret garden in the old district, and the underground jazz bars that only locals know about.`,
  };

  const defaultResponse = `That's a great question about ${city}! Based on my knowledge of ${country}, I'd recommend exploring both the popular attractions and venturing into local neighborhoods. The city has a unique character that blends history with modern culture. Would you like specific recommendations for activities, dining, or accommodations?`;

  const response = responses[userMessage] || defaultResponse;
  const words = response.split(' ');
  let currentText = '';
  
  for (const word of words) {
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 50));
    currentText += word + ' ';
    yield currentText.trim();
  }
}

/**
 * REAL AI: Call the server endpoint with user's API key
 */
async function callAIChat(
  city: string,
  country: string,
  message: string,
  extra?: { continent?: string; tags?: string[]; safetyScore?: number; dailyBudgetMid?: number }
): Promise<string> {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const headers = getAIHeaders();

  const res = await fetch(`${API_BASE}/api/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      city,
      country,
      message,
      continent: extra?.continent,
      tags: extra?.tags,
      safetyScore: extra?.safetyScore,
      dailyBudgetMid: extra?.dailyBudgetMid,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `AI request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.data?.response || 'Sorry, I could not generate a response.';
}

/**
 * Simulate streaming for a pre-fetched response by revealing words progressively
 */
async function* streamWords(fullText: string): AsyncGenerator<string> {
  const words = fullText.split(' ');
  let currentText = '';
  for (const word of words) {
    await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 25));
    currentText += word + ' ';
    yield currentText.trim();
  }
}

export function CityAIAssistant({ city, country, continent, tags, safetyScore, dailyBudgetMid, className }: CityAIAssistantProps) {
  const { config, isConfigured } = useAIConfig();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your AI assistant for ${city}. Ask me anything about visiting this amazing destination — from attractions and food to local tips and hidden gems!`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldScrollRef = useRef(false);

  // Only scroll within the chat container, NOT the entire page
  useEffect(() => {
    if (shouldScrollRef.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      shouldScrollRef.current = false;
    }
  }, [messages]);

  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    shouldScrollRef.current = true;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    const assistantMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }]);

    try {
      if (isConfigured) {
        // Real AI call
        const fullResponse = await callAIChat(city, country, text, {
          continent, tags, safetyScore, dailyBudgetMid,
        });

        // Stream the response word-by-word for a nice UX
        for await (const chunk of streamWords(fullResponse)) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: chunk }
                : msg
            )
          );
          shouldScrollRef.current = true;
        }
      } else {
        // Demo mode
        for await (const chunk of generateDemoResponse(city, country, text)) {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: chunk }
                : msg
            )
          );
          shouldScrollRef.current = true;
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Sorry, I had trouble responding.';
      setError(errorMsg);
      // Remove the empty assistant message
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, isConfigured, city, country, continent, tags, safetyScore, dailyBudgetMid]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn('glass-card-premium overflow-hidden flex flex-col', className)}>
      {/* Header */}
      <div className="relative px-5 py-4 border-b border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-r from-aurora/5 via-transparent to-voyage-500/5" />
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-xl gradient-ai flex items-center justify-center shadow-lg shadow-aurora/20">
              <Bot className="h-5 w-5 text-slate-50" />
            </div>
            <motion.div
              className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-canvas"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ backgroundColor: isConfigured ? '#10b981' : '#f59e0b' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-white flex items-center gap-2">
              {city} Assistant
              <Sparkles className="h-3.5 w-3.5 text-aurora-light" />
            </h3>
            <p className="text-xs text-slate-400 truncate">Ask me anything about {city}, {country}</p>
          </div>
          {/* Status badge */}
          {isConfigured ? (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Sparkles className="h-3 w-3 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">
                {PROVIDER_LABELS[config!.provider]}
              </span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <Key className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] text-amber-400 font-medium">Demo Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages - Scrollable container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto max-h-[400px] min-h-[300px] p-4 space-y-4 scrollbar-thin"
      >
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div className={cn(
                'h-8 w-8 rounded-lg flex items-center justify-center shrink-0',
                message.role === 'assistant' 
                  ? 'bg-aurora/10' 
                  : 'bg-white/[0.06]'
              )}>
                {message.role === 'assistant' ? (
                  <Bot className="h-4 w-4 text-aurora-light" />
                ) : (
                  <User className="h-4 w-4 text-slate-400" />
                )}
              </div>

              {/* Message bubble */}
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                message.role === 'assistant'
                  ? 'bg-white/[0.04] text-slate-200 rounded-tl-sm'
                  : 'bg-voyage-500/20 text-slate-50 rounded-tr-sm border border-voyage-500/20'
              )}>
                {message.content ? (
                  message.role === 'assistant' ? (
                    <Markdown
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-slate-300">{children}</li>,
                        hr: () => <hr className="border-white/[0.08] my-3" />,
                        a: ({ children, href }) => (
                          <a href={href} target="_blank" rel="noopener noreferrer" className="text-aurora-light underline underline-offset-2 hover:text-aurora">
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </Markdown>
                  ) : (
                    message.content
                  )
                ) : (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-aurora-light" />
                    <span className="text-slate-400">Thinking...</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-2 bg-red-500/10 border-t border-red-500/20"
          >
            <p className="text-xs text-red-400 text-center">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick prompts - only show when few messages */}
      {messages.length <= 3 && (
        <motion.div 
          className="px-4 py-3 border-t border-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">Quick prompts</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt, i) => (
              <motion.button
                key={prompt.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.1 }}
                onClick={() => handleSend(prompt.prompt)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] px-2.5 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all"
              >
                <prompt.icon className="h-3 w-3" />
                {prompt.label}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/[0.06] bg-white/[0.02]">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask about ${city}...`}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-voyage-500/40 transition-colors"
              disabled={isLoading}
            />
            {input && (
              <button
                onClick={() => setInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
              >
                <span className="sr-only">Clear</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <motion.button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={cn(
              'h-10 w-10 rounded-xl flex items-center justify-center transition-all shrink-0',
              input.trim() && !isLoading
                ? 'gradient-ai text-slate-50 shadow-lg shadow-aurora/20 hover:shadow-xl hover:shadow-aurora/30'
                : 'bg-white/[0.04] text-slate-500 cursor-not-allowed'
            )}
            whileHover={input.trim() && !isLoading ? { scale: 1.05 } : {}}
            whileTap={input.trim() && !isLoading ? { scale: 0.95 } : {}}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </motion.button>
        </div>
        
        {/* Status footer */}
        <div className="mt-2 flex items-center justify-center gap-2">
          {isConfigured ? (
            <span className="text-[10px] text-emerald-500/60">
              Powered by {PROVIDER_LABELS[config!.provider]} · {config!.model}
            </span>
          ) : (
            <>
              <span className="text-[10px] text-slate-600">
                Demo mode — Add your API key via the
              </span>
              <span className="text-[10px] text-aurora-light">
                AI API Key
              </span>
              <span className="text-[10px] text-slate-600">
                button for real AI responses
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
