"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function AnimatedSection({ 
  children, 
  className, 
  id,
  delay = 0
}: { 
  children: ReactNode; 
  className?: string; 
  id?: string;
  delay?: number;
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, type: "spring", bounce: 0.3 }}
    >
      {children}
    </motion.section>
  );
}

export function AnimatedCard({ 
  children, 
  className,
  delay = 0 
}: { 
  children: ReactNode; 
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay, type: "spring", bounce: 0.4 }}
      whileHover={{ y: -10 }}
    >
      {children}
    </motion.div>
  );
}
