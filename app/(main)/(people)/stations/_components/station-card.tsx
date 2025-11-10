"use client";
import React, { useEffect, useId, useRef, useState } from "react";
// images removed: station card uses icon/banner instead of photos
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { Mail, Info } from "lucide-react";

type CardType = {
  description: string;
  title: string;
  ctaText: string;
  ctaLink: string;
  content: React.ReactNode | (() => React.ReactNode);
};

const cards: CardType[] = [
  {
    title: "Station A",
    description: "Main entrance station",
    ctaText: "Manage",
    ctaLink: "#",
    content: () => <p>Details and configuration for Station A.</p>,
  },
  {
    title: "Station B",
    description: "Secondary counter",
    ctaText: "Manage",
    ctaLink: "#",
    content: () => <p>Details and configuration for Station B.</p>,
  },
];

export default function StationCard() {
  const [active, setActive] = useState<CardType | boolean | null>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActive(false);
    }

    if (active && typeof active === "object")
      document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {active && typeof active === "object" ? (
          <div className="fixed inset-0 grid place-items-center z-100">
            <motion.button
              key={`button-${active.title}-${id}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActive(null)}
            >
              <CloseIcon />
            </motion.button>

            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div
                layoutId={`image-${active.title}-${id}`}
                className="w-full"
              >
                <div className="w-full h-48 md:h-64 lg:h-80 bg-linear-to-b from-neutral-100 to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 flex items-center justify-center">
                  <div className="h-24 w-24 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Info className="h-8 w-8" />
                  </div>
                </div>
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div>
                    <motion.h3
                      layoutId={`title-${active.title}-${id}`}
                      className="font-medium text-neutral-700 dark:text-neutral-200 text-base"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${active.description}-${id}`}
                      className="text-neutral-600 dark:text-neutral-400 text-base"
                    >
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    href={active.ctaLink}
                    target="_blank"
                    className="px-4 py-3 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    {active.ctaText}
                  </motion.a>
                </div>

                <div className="pt-4 relative px-4">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs md:text-sm lg:text-base h-40 md:h-fit pb-10 flex flex-col items-start gap-4 overflow-auto dark:text-neutral-400"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <ul className="max-w-2xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 items-start gap-4">
        {cards.map((card) => (
          <motion.div
            key={card.title}
            layoutId={`card-${card.title}-${id}`}
            onClick={() => setActive(card)}
            className="p-2 flex flex-col hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-xl cursor-pointer"
          >
            <div className="w-full max-w-sm h-[200px] p-2">
              <div className="scale-in group visible cursor-pointer h-full">
                <div
                  className={`relative transform overflow-hidden rounded-2xl p-6 shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-lg bg-card text-card-foreground border border-border h-full flex flex-col`}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-primary" />

                  <div className="relative flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Info className="h-5 w-5" />
                      </div>

                      <h3
                        className="font-sans font-semibold leading-tight truncate"
                        style={{ fontSize: "clamp(0.8rem, 2.5vw, 1.125rem)" }}
                      >
                        {card.title}
                      </h3>

                      <p
                        className="text-sm text-muted-foreground capitalize truncate"
                        style={{ fontSize: "clamp(0.7rem, 2vw, 0.875rem)" }}
                      >
                        {card.description}
                      </p>
                    </div>

                    <div className="h-px bg-border/50 my-2" />

                    <div className="flex items-center text-muted-foreground overflow-hidden whitespace-nowrap">
                      <Mail className="mr-2 h-4 w-4 text-primary/70 shrink-0" />
                      <span
                        className="truncate"
                        style={{ fontSize: "clamp(0.7rem, 1.8vw, 0.875rem)" }}
                      >
                        {card.ctaLink}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </ul>
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-black"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};
