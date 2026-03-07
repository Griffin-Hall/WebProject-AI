import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterOptions {
  strings: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
}

export function useTypewriter({
  strings,
  typeSpeed = 55,
  deleteSpeed = 30,
  pauseDuration = 2500,
}: UseTypewriterOptions) {
  const [text, setText] = useState('');
  const [stringIndex, setStringIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const tick = useCallback(() => {
    const currentString = strings[stringIndex];

    if (isPaused) return;

    if (!isDeleting) {
      // Typing
      if (text.length < currentString.length) {
        setText(currentString.slice(0, text.length + 1));
      } else {
        // Finished typing, pause before deleting
        setIsPaused(true);
        setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
      }
    } else {
      // Deleting
      if (text.length > 0) {
        setText(currentString.slice(0, text.length - 1));
      } else {
        // Finished deleting, move to next string
        setIsDeleting(false);
        setStringIndex((prev) => (prev + 1) % strings.length);
      }
    }
  }, [text, stringIndex, isDeleting, isPaused, strings, pauseDuration]);

  useEffect(() => {
    if (isPaused) return;

    const speed = isDeleting ? deleteSpeed : typeSpeed;
    const timer = setTimeout(tick, speed);
    return () => clearTimeout(timer);
  }, [tick, isDeleting, typeSpeed, deleteSpeed, isPaused]);

  return { text, isTyping: !isPaused && !isDeleting };
}
