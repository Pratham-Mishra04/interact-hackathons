'use client';

import { useInView, useAnimation, motion } from 'motion/react';
import React, { useEffect, useRef } from 'react';

const FadeIn = ({
  children,
  className,
  initialScale = 0.95,
  delay = 0,
  duration = 0.75,
  initialOpacity = 0,
}: {
  children: React.ReactNode;
  className?: string;
  initialScale?: number;
  delay?: number;
  duration?: number;
  initialOpacity?: number
}) => {
  const motionRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const inView = useInView(motionRef, {
    once: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    } else {
      controls.start('hidden');
    }
  }, [inView, controls]);

  return (
    <motion.div
      className={className}
      ref={motionRef}
      animate={controls}
      initial={'hidden'}
      variants={{
        hidden: { opacity: initialOpacity, scale: initialScale },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: duration, ease: 'easeOut', delay } },
      }}
    >
      {children}
    </motion.div>
  );
};
export default FadeIn;
