import { useEffect, useRef, useState } from "react";
import { buildCursorCssValue } from "../lib/catalog";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, label, summary, [data-interactive="true"]';

export function setGlobalSiteCursor(presetId = "neon-arrow", color = "#6cc4ff") {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("upet_site_cursor", presetId);
    localStorage.setItem("upet_site_cursor_color", color);
  } catch {
    /* ignore storage errors */
  }
  window.dispatchEvent(new CustomEvent("upet:site-cursor-change", { detail: { presetId, color } }));
}

export const SiteCursor = () => {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const glowRef = useRef(null);
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia?.("(pointer: fine)");
    const reduceMq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const isFine = Boolean(mq?.matches);
    setFinePointer(isFine);

    const applyCursorVars = (presetId, color) => {
      const id = presetId || localStorage.getItem("upet_site_cursor") || "neon-arrow";
      const accent = color || localStorage.getItem("upet_site_cursor_color") || "#6cc4ff";
      const mainCss = buildCursorCssValue(id === "default" ? "neon-arrow" : id, accent);
      const pointerCss = buildCursorCssValue(id === "default" ? "cyber-ring" : id, "#38bdf8");
      if (mainCss) {
        document.documentElement.style.setProperty("--upet-site-cursor", mainCss);
      }
      if (pointerCss) {
        document.documentElement.style.setProperty(
          "--upet-site-cursor-pointer",
          pointerCss.replace(/\bdefault\b$/, "pointer")
        );
      }
    };

    applyCursorVars();

    const onCursorChange = (e) => {
      applyCursorVars(e.detail?.presetId, e.detail?.color);
    };
    window.addEventListener("upet:site-cursor-change", onCursorChange);

    if (!isFine || reduceMq?.matches) {
      return () => window.removeEventListener("upet:site-cursor-change", onCursorChange);
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let hoveringInteractive = false;
    let pressed = false;
    let visible = false;
    let rafId = 0;

    const tick = () => {
      ringX += (mouseX - ringX) * 0.22;
      ringY += (mouseY - ringY) * 0.22;
      const ringEl = ringRef.current;
      const dotEl = dotRef.current;
      const glowEl = glowRef.current;

      if (ringEl) {
        const scale = pressed ? 0.78 : hoveringInteractive ? 1.55 : 1;
        ringEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringEl.style.opacity = visible ? (hoveringInteractive ? "0.95" : "0.65") : "0";
        ringEl.style.borderColor = hoveringInteractive
          ? "rgba(108, 196, 255, 0.9)"
          : "rgba(108, 196, 255, 0.42)";
        ringEl.style.backgroundColor = hoveringInteractive
          ? "rgba(56, 189, 248, 0.12)"
          : "rgba(56, 189, 248, 0.03)";
      }
      if (dotEl) {
        dotEl.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) scale(${
          pressed ? 1.6 : hoveringInteractive ? 0.5 : 1
        })`;
        dotEl.style.opacity = visible ? "0.9" : "0";
      }
      if (glowEl) {
        glowEl.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
        glowEl.style.opacity = visible ? (hoveringInteractive ? "0.26" : "0.14") : "0";
      }
      rafId = 0;
      if (Math.hypot(mouseX - ringX, mouseY - ringY) > 0.35) {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const scheduleTick = () => {
      if (!rafId) rafId = window.requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!visible) {
        ringX = mouseX;
        ringY = mouseY;
        visible = true;
      }
      const target = e.target;
      hoveringInteractive = Boolean(target?.closest?.(INTERACTIVE_SELECTOR));
      scheduleTick();
    };

    const onDown = () => {
      pressed = true;
      scheduleTick();
    };

    const onUp = () => {
      pressed = false;
      scheduleTick();
    };

    const onLeave = () => {
      visible = false;
      scheduleTick();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave, { passive: true });

    return () => {
      window.removeEventListener("upet:site-cursor-change", onCursorChange);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  if (!finePointer) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden="true"
      data-testid="site-cursor-layer"
    >
      <div
        ref={glowRef}
        className="fixed left-0 top-0 h-56 w-56 rounded-full opacity-0 transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.45) 0%, rgba(34, 211, 238, 0.12) 45%, transparent 72%)",
          filter: "blur(18px)",
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={ringRef}
        className="fixed left-0 top-0 h-7 w-7 rounded-full border border-sky-400/45 opacity-0 transition-[border-color,background-color,opacity] duration-150"
        style={{
          boxShadow: "0 0 18px rgba(56, 189, 248, 0.35)",
          willChange: "transform, opacity",
        }}
      />
      <div
        ref={dotRef}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-sky-300 opacity-0 transition-opacity duration-150"
        style={{
          boxShadow: "0 0 10px #6cc4ff, 0 0 20px #38bdf8",
          willChange: "transform, opacity",
        }}
      />
    </div>
  );
};
