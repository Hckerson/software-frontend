"use client";
import { motion } from "motion/react";
import { PropsWithChildren } from "react";
import { MOTION_DURATION, MOTION_SPRING } from "@/lib/constants";

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
    duration = MOTION_DURATION.fast,
    yOffset = 0,
    xOffset = 0,
    className,
    scale,
}: Props) {
    return (
        <motion.div
            initial={{ opacity: 0, y: yOffset, x: xOffset, scale: scale }}
            whileInView={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration, delay, ...MOTION_SPRING }}
            viewport={{ once: true }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
