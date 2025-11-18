"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatBookingDate = formatBookingDate;
const luxon_1 = require("luxon");
/**
 * Formats a booking date string into Spanish, Eastern Time.
 *
 * Example: "2025-11-18T13:00:00.000Z" → "martes 18 de noviembre a las 8:00 AM"
 *
 * @param {string} isoDate - ISO string in UTC
 * @return {string} A human-readable string in Spanish
 */
function formatBookingDate(isoDate) {
    return luxon_1.DateTime.fromISO(isoDate, { zone: "America/New_York" })
        .setLocale("es")
        .toFormat("cccc d 'de' LLLL 'a las' h:mm a");
}
//# sourceMappingURL=formatBookingDate.js.map