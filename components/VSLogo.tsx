import { motion } from "framer-motion";

export default function VSLogo() {
  return (
    <motion.div
      className="flex justify-center items-center text-white bg-gradient-to-r from-blue-500 to-red-500 rounded-full w-16 h-16 shadow-lg"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      whileHover={{ rotate: 360 }}
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
