import { PawPrint } from "lucide-react";

export const Logo = ({ className = "", large = false }) => (
  <span
    className={`group inline-flex items-center gap-2.5 font-display font-extrabold tracking-tight text-white ${className}`}
  >
    <span
      className={`relative grid place-items-center rounded-xl border border-sky-200/35 bg-gradient-to-br from-sky-300 via-sky-400 to-cyan-500 text-slate-950 shadow-[0_6px_22px_-4px_rgba(56,189,248,0.75)] transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_8px_28px_-2px_rgba(56,189,248,0.95)] ${
        large ? "h-11 w-11 rounded-2xl" : "h-8 w-8"
      }`}
    >
      <span className={`${large ? "text-xl" : "text-base"} font-black leading-none tracking-tighter`}>
        U
      </span>
      <PawPrint
        className={`absolute text-sky-300 drop-shadow-[0_2px_6px_rgba(14,165,233,0.9)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:rotate-12 group-hover:scale-110 ${
          large ? "-right-2 -top-2 h-4 w-4" : "-right-1.5 -top-1.5 h-3.5 w-3.5"
        }`}
        fill="currentColor"
      />
    </span>
    <span className={`${large ? "text-xl" : "text-lg"} font-extrabold tracking-tight`}>
      user<span className="bg-gradient-to-r from-sky-300 to-cyan-400 bg-clip-text text-transparent">.pet</span>
    </span>
  </span>
);
