import { motion } from "framer-motion";

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center bg-gradient-to-b from-gray-50 to-gray-100">
      
      {/* Animated Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "backOut" }}
        className="mb-6"
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </motion.div>

      {/* Main Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-4xl font-extrabold text-gray-800 mb-3 tracking-tight"
      >
        🚧 Feature Coming Soon
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-lg text-gray-600 max-w-md leading-relaxed"
      >
        This feature isn't available yet.  
        We’re working on upgrading it for you. Please check back soon!
      </motion.p>

      {/* Button */}
      <motion.a
        href="/"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mt-8 inline-block px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 hover:shadow-lg transition-all"
      >
        ⬅ Back to Home
      </motion.a>
    </div>
  );
}
