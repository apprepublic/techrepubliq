"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useTone } from "@/lib/theme";

interface AccordionItem {
  id?: string;
  question: string;
  answer: string;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  initialOpen?: string | null;
}

export function Accordion({ items, className, initialOpen }: AccordionProps) {
  const t = useTone();
  const [openIndex, setOpenIndex] = useState<number | null>(() => {
    if (initialOpen) {
      const idx = items.findIndex((item) => item.id === initialOpen);
      return idx >= 0 ? idx : null;
    }
    return null;
  });

  useEffect(() => {
    if (initialOpen) {
      const idx = items.findIndex((item) => item.id === initialOpen);
      if (idx >= 0) setOpenIndex(idx);
    }
  }, [initialOpen, items]);

  return (
    <div className={cn("divide-y rounded-[16px] border", t.border, className)}>
      {items.map((item, i) => (
        <div key={item.id ?? i} id={item.id}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className={cn("flex items-center justify-between w-full px-4 py-4 text-left text-[15px] font-medium", t.ink)}
            aria-expanded={openIndex === i}
          >
            {item.question}
            <motion.span
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              <ChevronDown size={18} className={cn("shrink-0", t.muted)} />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className={cn("px-4 pb-4 text-[14px] leading-relaxed", t.muted)}>{item.answer}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
