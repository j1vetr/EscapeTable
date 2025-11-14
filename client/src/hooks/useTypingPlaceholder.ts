import { useState, useEffect } from "react";

export function useTypingPlaceholder(productNames: string[] = [], isPaused: boolean = false) {
  const [placeholder, setPlaceholder] = useState("Ürün Ara...");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (isPaused || productNames.length === 0) {
      setPlaceholder("Ürün Ara...");
      return;
    }

    const currentName = productNames[currentIndex] || "Ürün Ara...";
    let timeoutId: NodeJS.Timeout;

    if (isTyping) {
      // Typing phase
      if (charIndex < currentName.length) {
        timeoutId = setTimeout(() => {
          setPlaceholder(currentName.substring(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        }, 100);
      } else {
        // Pause before erasing
        timeoutId = setTimeout(() => {
          setIsTyping(false);
        }, 2000);
      }
    } else {
      // Erasing phase
      if (charIndex > 0) {
        timeoutId = setTimeout(() => {
          setPlaceholder(currentName.substring(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        }, 50);
      } else {
        // Move to next product
        setCurrentIndex(prev => (prev + 1) % productNames.length);
        setIsTyping(true);
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPaused, productNames.length, currentIndex, isTyping, charIndex]);

  return placeholder;
}
