"use client";
import { motion } from "motion/react";
import { PropsWithChildren } from "react";
import { fast } from "@/lib/data/mapped-data";

interface Props extends PropsWithChildren {
    delay?: number;
    duration?: number;
    yOffset?: number;
    xOffset?: number;
    className?: string;
    scale?: number;
}

export default function MotionWrapper({
    children,
    delay = 0,
    duration = fast,
    yOffset = 0,
    xOffset = 0,
    className,
    scale,
}: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: yOffset, x: xOffset, scale: scale }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            transition={{
                duration,
                delay,
                type: "spring",
                stiffness: 100,
                damping: 30,
                ease: "easeOut",
            }}
            viewport={{ once: true }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
