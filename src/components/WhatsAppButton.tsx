import { motion } from "framer-motion";

const WhatsAppButton = ({ phoneNumber = "5500000000000" }: { phoneNumber?: string }) => {
  return (
    <motion.a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-mint shadow-soft text-primary-foreground text-2xl"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
      aria-label="Fale conosco no WhatsApp"
    >
      💬
    </motion.a>
  );
};

export default WhatsAppButton;
