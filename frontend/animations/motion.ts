import { Variants } from "framer-motion";

// -----------------------------------------------------------------------------
// Transition Defaults
// -----------------------------------------------------------------------------
export const transitions = {
  micro: { duration: 0.15, ease: "easeOut" }, // 150ms
  hover: { duration: 0.2, ease: "easeOut" }, // 200ms
  drawer: { type: "spring" as const, stiffness: 300, damping: 30 }, // ~350ms feel
  dialog: { type: "spring" as const, stiffness: 350, damping: 35 }, // ~300ms feel
  page: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }, // 400ms custom ease
};

// -----------------------------------------------------------------------------
// Fade Animations
// -----------------------------------------------------------------------------
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.page },
  exit: { opacity: 0, transition: transitions.page },
};

// -----------------------------------------------------------------------------
// Slide Animations
// -----------------------------------------------------------------------------
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitions.page },
  exit: { opacity: 0, y: -12, transition: transitions.page },
};

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: transitions.page },
  exit: { opacity: 0, x: 20, transition: transitions.page },
};

// -----------------------------------------------------------------------------
// Scale / Dialog Animations
// -----------------------------------------------------------------------------
export const scaleDialogVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: { opacity: 1, scale: 1, transition: transitions.dialog },
  exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } },
};

export const drawerVariants: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: transitions.drawer },
  exit: { x: "100%", transition: { duration: 0.25, ease: "easeIn" } },
};

// -----------------------------------------------------------------------------
// Card / Staggered Content Animations
// -----------------------------------------------------------------------------
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.02, // 20ms stagger — fast enough to feel instant
      delayChildren: 0,
    },
  },
};

export const cardItemVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 500, damping: 40, mass: 0.5 }
  },
};

export const hoverCardVariants = {
  rest: { y: 0, scale: 1, boxShadow: "var(--shadow-md)" },
  hover: { 
    y: -4, 
    scale: 1.01, 
    boxShadow: "var(--shadow-xl)", 
    transition: transitions.hover 
  },
};

// -----------------------------------------------------------------------------
// Interactive Element Animations
// -----------------------------------------------------------------------------
export const buttonTapVariants = {
  tap: { scale: 0.96, transition: transitions.micro },
};

export const checkmarkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
};
