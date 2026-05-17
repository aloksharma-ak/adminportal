import { motion } from "framer-motion";

export function HamburgerButton({
  open,
  onClick,
  barClassName,
}: {
  open: boolean;
  onClick: () => void;
  barClassName: string;
}) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      onClick={onClick}
      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white/60 transition active:scale-95 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
    >
      <motion.div
        className="flex flex-col items-center justify-center gap-1.5"
        initial={false}
        animate={open ? "open" : "closed"}
      >
        <motion.div
          className={barClassName}
          variants={{
            closed: { rotate: 0, y: 0, width: 24 },
            open: { rotate: 45, y: 6, width: 24 },
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />

        <motion.div
          className={barClassName}
          variants={{
            closed: { opacity: 1, scaleX: 1 },
            open: { opacity: 0, scaleX: 0 },
          }}
          transition={{ duration: 0.15 }}
        />

        <motion.div
          className={barClassName}
          variants={{
            closed: { rotate: 0, y: 0, width: 24 },
            open: { rotate: -45, y: -6, width: 24 },
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.div>
    </button>
  );
}
