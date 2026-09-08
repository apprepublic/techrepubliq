"use client";

import { motion, AnimatePresence } from "motion/react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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
    <div className={cn("divide-y divide-line", className)}>
      {items.map((item, i) => (
        <div key={item.id ?? i} id={item.id}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex items-center justify-between w-full py-md text-left text-md font-body font-medium text-ink hover:text-accent transition-colors duration-150"
            aria-expanded={openIndex === i}
          >
            {item.question}
            <motion.span
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <ChevronDown size={18} className="text-slate shrink-0" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {openIndex === i && (
              <motion.div
                key="content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                className="overflow-hidden"
              >
                <div className="pb-md text-sm text-slate leading-relaxed">
                  {item.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}