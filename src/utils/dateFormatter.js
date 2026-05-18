/**
 * Shared Date Formatter Utilities
 * Consolidates date parsing, string generation, and standard relative time formats
 */

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

export const formatDateFullStr = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatDateShort = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US');
};

export const formatTimeStr = (time) => {
    if (!time) return '';
    const t = new Date(time);
    return t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export const formatDateLabel = (dt, timeLabel) => {
    return `${MONTH_NAMES[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()} - ${timeLabel}`;
};

export const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
};

export const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
};

export const getMonthName = (month) => {
    return MONTH_NAMES[month];
};

export const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

export const isToday = (year, month, day) => {
    const today = new Date();
    return today.getFullYear() === year &&
        today.getMonth() === month &&
        today.getDate() === day;
};

export const isPastDate = (year, month, day) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
};
