import {
    Inter,
    Anton_SC,
    Poppins,
    Chivo_Mono,
    Plus_Jakarta_Sans,
} from "next/font/google";

const inter = Inter({
    fallback: ["system-ui", "arial"],
    subsets: ["latin"],
});

const antonSc = Anton_SC({
    fallback: ["system-ui", "arial"],
    weight: ["400"],
    subsets: ["latin"],
});

const poppins = Poppins({
    fallback: ["system-ui", "arial"],
    weight: ["400", "500", "600", "700"],
    subsets: ["latin"],
});

const chivoMono = Chivo_Mono({
    fallback: ["system-ui", "arial"],
    subsets: ["latin"],
});

const jarkata = Plus_Jakarta_Sans({
    fallback: ["system-ui", "arial"],
    subsets: ["latin"],
});

export { inter, chivoMono, jarkata, poppins, antonSc };
