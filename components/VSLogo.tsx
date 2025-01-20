import { motion } from "framer-motion";

export default function VSLogo() {
  return (
    <motion.div
      className="flex justify-center items-center text-black"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
    >
      <motion.span
        className="text-2xl font-bold"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        VS
      </motion.span>
    </motion.div>
  );
}
