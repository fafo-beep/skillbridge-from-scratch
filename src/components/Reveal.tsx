"use client";

import { useEffect } from "react";

// Attaches staggered entrance animations to every [data-reveal] element
// below the fold. Content stays visible if JS never runs; reduced motion
// opts out entirely (see globals.css).
export default function Reveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    const perSection = new Map<Element, number>();
    els.forEach((el) => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
        const section = el.closest("section, footer") ?? document.body;
        const i = perSection.get(section) ?? 0;
        perSection.set(section, i + 1);
        el.style.transitionDelay = `${Math.min(i, 5) * 80}ms`;
        el.classList.add("ts-reveal");
        io.observe(el);
      }
    });
    return () => io.disconnect();
  }, []);
  return null;
}
