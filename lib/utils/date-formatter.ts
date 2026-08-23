import { format } from "date-fns";

export const dateFormatter = (date: string, formatString: string) => {
    if (!date) return "";
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? date : format(dateObj, formatString);
};
