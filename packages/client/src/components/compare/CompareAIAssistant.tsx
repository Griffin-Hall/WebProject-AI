import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react';
import Markdown from 'react-markdown';
import type { DestinationDetail } from '@voyage-matcher/shared';
import { cn } from '@/lib/utils';
import { getAIHeaders, useAIConfig, PROVIDER_LABELS } from '@/hooks/useAIConfig';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface CompareAIAssistantProps {
  destinations: DestinationDetail[];
  className?: string;
}

const QUICK_PROMPTS = [
  'Which destination is best for solo travel in March?',
  'Which option is cheapest for a 7-day trip?',
  'Which destination is the safest overall?',
  'Which pair gives the best weather-to-cost balance?',
];

function monthName(month: number) {
  return new Date(2025, month - 1).toLocaleString('en-US', { month: 'long' });
}

function getDestinationMonthTemp(destination: DestinationDetail, month: number) {
  return destination.weather.find((entry) => entry.month === month)?.avgTempC ?? null;
}

function buildDemoComparison(destinations: DestinationDetail[], message: string) {
  const lower = message.toLowerCase();

  const cheapest = [...destinations]
    .filter((destination) => destination.costs)
    .sort((a, b) => (a.costs?.dailyBudgetMid ?? Infinity) - (b.costs?.dailyBudgetMid ?? Infinity))[0];

  const safest = [...destinations]
    .filter((destination) => destination.safety)
    .sort((a, b) => (b.safety?.safetyScore ?? -1) - (a.safety?.safetyScore ?? -1))[0];

  if (lower.includes('march')) {
    const lines = destinations
      .map((destination) => {
        const marchTemp = getDestinationMonthTemp(destination, 3);
        if (marchTemp === null) {
          return `- **${destination.city}**: March weather data unavailable.`;
        }
        return `- **${destination.city}**: around ${Math.round(marchTemp)}°C in ${monthName(3)}.`;
      })
      .join('\n');

    return `For March, here's the quick weather read:\n\n${lines}\n\nIf solo travel is your priority, I would start with **${safest?.city ?? destinations[0].city}** for the strongest safety profile and reliable conditions.`;
  }

  if (lower.includes('cheap') || lower.includes('cheaper') || lower.includes('cost')) {
    if (!cheapest?.costs) {
      return 'I could not find enough cost data across these destinations yet.';
    }
    const perWeek = Math.round(cheapest.costs.dailyBudgetMid * 7);
    return `Based on current mid-tier daily budgets, **${cheapest.city}** is the most affordable choice at roughly **$${Math.round(cheapest.costs.dailyBudgetMid)}/day** (about **$${perWeek}** for 7 days, excluding flights).`;
  }

  if (lower.includes('safe')) {
    if (!safest?.safety) {
      return 'I could not find enough safety data across these destinations yet.';
    }
    return `For safety, **${safest.city}** leads this comparison with a safety score of **${safest.safety.safetyScore}/100**.`;
  }

  return `Here is a quick comparison snapshot:\n\n- **Best value**: ${cheapest?.city ?? destinations[0].city}\n- **Strongest safety profile**: ${safest?.city ?? destinations[0].city}\n- **Most balanced pick overall**: ${safest?.city ?? destinations[0].city}\n\nIf you share your month and trip style, I can rank these destinations more precisely.`;
}

async function* streamWords(fullText: string): AsyncGenerator<string> {
  const words = fullText.split(' ');
  let currentText = '';
  for (const word of words) {
    await new Promise((resolve) => setTimeout(resolve, 15 + Math.random() * 25));
    currentText += `${word} `;
    yield currentText.trim();
  }
}

async function requestCompareResponse(destinations: DestinationDetail[], message: string): Promise<string> {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const headers = getAIHeaders();

  const response = await fetch(`${API_BASE}/api/ai/compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({
      message,
      destinations: destinations.map((destination) => ({
        id: destination.id,
        city: destination.city,
        country: destination.country,
        continent: destination.continent,
        tags: destination.tags.map((tag) => tag.tag),
        safetyScore: destination.safety?.safetyScore ?? null,
        advisoryLevel: destination.safety?.advisoryLevel ?? null,
        dailyBudgetLow: destination.costs?.dailyBudgetLow ?? null,
        dailyBudgetMid: destination.costs?.dailyBudgetMid ?? null,
        dailyBudgetHigh: destination.costs?.dailyBudgetHigh ?? null,
        weather: destination.weather.map((entry) => ({
          month: entry.month,
          avgTempC: entry.avgTempC,
          avgRainfallMm: entry.avgRainfallMm,
          sunshineHours: entry.sunshineHours,
        })),
      })),
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Compare AI failed (${response.status})`);
  }

  const body = await response.json();
  return body.data?.response || 'I could not generate a comparison response.';
}

export function CompareAIAssistant({ destinations, className }: CompareAIAssistantProps) {
  const { config, isConfigured } = useAIConfig();
  const destinationNames = useMemo(
    () => destinations.map((destination) => destination.city).join(', '),
    [destinations],
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Ask me to compare ${destinationNames}. I can reason about weather, budget, safety, and trip style fit.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Ask me to compare ${destinationNames}. I can reason about weather, budget, safety, and trip style fit.`,
      },
    ]);
  }, [destinationNames]);

  useEffect(() => {
    if (!shouldScrollRef.current || !messageContainerRef.current) return;
    messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    shouldScrollRef.current = false;
  }, [messages]);

  const handleSend = useCallback(
    async (prompt?: string) => {
      const message = (prompt ?? input).trim();
      if (!message || isLoading) return;

      shouldScrollRef.current = true;
      const userMessageId = `${Date.now()}-user`;
      const assistantMessageId = `${Date.now()}-assistant`;
      setMessages((previous) => [...previous, { id: userMessageId, role: 'user', content: message }]);
      setMessages((previous) => [...previous, { id: assistantMessageId, role: 'assistant', content: '' }]);
      setInput('');
      setIsLoading(true);
      setError(null);

      try {
        const responseText = isConfigured
          ? await requestCompareResponse(destinations, message)
          : buildDemoComparison(destinations, message);

        for await (const chunk of streamWords(responseText)) {
          setMessages((previous) =>
            previous.map((entry) =>
              entry.id === assistantMessageId ? { ...entry, content: chunk } : entry,
            ),
          );
          shouldScrollRef.current = true;
        }
      } catch (responseError) {
        setMessages((previous) => previous.filter((entry) => entry.id !== assistantMessageId));
        setError(responseError instanceof Error ? responseError.message : 'Could not compare destinations.');
      } finally {
        setIsLoading(false);
      }
    },
    [destinations, input, isConfigured, isLoading],
  );

  return (
    <section className={cn('glass-card-premium overflow-hidden', className)}>
      <header className="border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-ai text-slate-50 shadow-lg shadow-voyage-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-sm font-semibold text-white">AI Compare Agent</h3>
              <p className="text-xs text-slate-400">Context-aware destination comparison assistant</p>
            </div>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1 rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-1 text-[11px] text-slate-300">
            <Sparkles className="h-3 w-3 text-voyage-300" />
            {isConfigured ? PROVIDER_LABELS[config!.provider] : 'Demo Mode'}
          </div>
        </div>
      </header>

      <div ref={messageContainerRef} className="max-h-[360px] min-h-[240px] space-y-3 overflow-y-auto p-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className={cn('flex gap-2.5', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {message.role === 'assistant' && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-voyage-500/15 text-voyage-300">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm',
                  message.role === 'assistant'
                    ? 'rounded-tl-sm bg-white/[0.04] text-slate-200'
                    : 'rounded-tr-sm border border-voyage-500/35 bg-voyage-500/18 text-slate-50',
                )}
              >
                {message.content ? (
                  message.role === 'assistant' ? (
                    <Markdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc space-y-1 pl-4">{children}</ul>,
                        li: ({ children }) => <li>{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-slate-50">{children}</strong>,
                      }}
                    >
                      {message.content}
                    </Markdown>
                  ) : (
                    message.content
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Thinking...
                  </span>
                )}
              </div>
              {message.role === 'user' && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-slate-300">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {error && (
        <div className="border-y border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-400">{error}</div>
      )}

      {messages.length <= 2 && (
        <div className="border-t border-white/[0.06] px-4 py-3">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-slate-500">Ask quickly</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSend(prompt)}
                className="rounded-lg border border-white/[0.09] bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-300 transition-all hover:border-voyage-400/35 hover:text-white"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-white/[0.06] bg-white/[0.02] p-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about these destinations..."
            className="flex-1 rounded-xl border border-white/[0.1] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-voyage-400/45 focus:outline-none"
            disabled={isLoading}
          />
          <motion.button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            whileTap={input.trim() && !isLoading ? { scale: 0.96 } : {}}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-xl transition-all',
              input.trim() && !isLoading
                ? 'gradient-ai text-slate-50 shadow-lg shadow-voyage-500/25'
                : 'cursor-not-allowed bg-white/[0.05] text-slate-500',
            )}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </motion.button>
        </div>
      </div>
    </section>
  );
}
