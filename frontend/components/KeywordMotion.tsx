"use client";
import { motion, Variants } from "framer-motion";

export default function KeywordMotion() {
  const wordVariant: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.5,
        // use numeric cubic-bezier or array easing to satisfy types
        ease: [0.22, 1, 0.36, 1],
      },
    }),
    hover: {
      scale: 1.05,

      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  const words = ["Affordable.", "Authentic.", "Effective"];

  return (
    <div className="text-center mb-16">
      <h2 className="text-3xl md:text-[40px] font-bold text-primary flex flex-wrap justify-center gap-2">
        {words.map((w, i) => (
          <motion.span
            key={w}
            custom={i}
            variants={wordVariant}
            initial="hidden"
            whileInView="visible"
            whileHover="hover"
            viewport={{ once: true }}
            className={
              i === 1
                ? "text-secondary inline-block cursor-pointer"
                : "inline-block cursor-pointer"
            }
          >
            {w}
          </motion.span>
        ))}
      </h2>
    </div>
  );
}
