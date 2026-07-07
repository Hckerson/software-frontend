export const parseLocalDate = (dateStr: string | Date | undefined): Date => {
    if (!dateStr) return new Date();
    if (dateStr instanceof Date) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // 0-based index
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    return new Date(dateStr);
};
