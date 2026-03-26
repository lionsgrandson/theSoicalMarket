"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  words: string[];
  speed?: number; // ms per character
  pause?: number; // pause after a word is typed
  className?: string;
}

export default function Typewriter({
  words,
  speed = 80,
  pause = 2000,
  className = "",
}: Props) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "deleting">("typing");

  useEffect(() => {
    const current = words[index];
    let timer: NodeJS.Timeout;

    if (phase === "typing") {
      if (text.length < current.length) {
        timer = setTimeout(
          () => setText(current.slice(0, text.length + 1)),
          speed
        );
      } else {
        timer = setTimeout(() => setPhase("deleting"), pause);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(
          () => setText(current.slice(0, text.length - 1)),
          speed / 2
        );
      } else {
        setIndex((i) => (i + 1) % words.length);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, index, words, speed, pause]);

  return (
    <motion.span
      className={`text-4xl md:text-5xl  font-bold text-primary ${className}`}
      // animate={{ opacity: [0.8, 1, 0.8] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      {text}
      <motion.span
        className="inline-block w-[1ch]"
        // animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.7, repeat: Infinity }}
      >
        |
      </motion.span>
    </motion.span>
  );
}
