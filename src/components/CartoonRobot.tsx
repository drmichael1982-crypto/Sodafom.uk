import { motion } from 'motion/react';
interface CartoonRobotProps {
  size?: number;
  className?: string;
}

export function CartoonRobot({ size = 100, className = '' }: CartoonRobotProps) {
  return (
    <motion.div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={{
        y: [0, -8, 0],
        rotate: [-2, 2, -2]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="absolute inset-1 bg-cyan-300/35 blur-xl rounded-full" />
      <img
        src="/assets/cartoon/friends/soda-bot.png"
        alt="Sodafom AI teacher"
        className="relative h-full w-full rounded-3xl object-contain drop-shadow-xl"
      />
    </motion.div>
  );
}
