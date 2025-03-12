
// Time utility functions for scheduled checks

// Time to check for violations (6 AM PST)
export const CHECK_HOUR_PST = 6;

/**
 * Convert PST hour to local time
 * @returns Date object representing the next check time in local timezone
 */
export const getPSTCheckTimeInLocalTime = (): Date => {
  const now = new Date();
  const localTime = new Date();
  
  // PST is UTC-8 (standard time) or UTC-7 (daylight saving time)
  // We'll use a simple approach to determine if DST is in effect
  const isDST = (): boolean => {
    // Simple check for DST in the US
    const januaryOffset = new Date(now.getFullYear(), 0, 1).getTimezoneOffset();
    const julyOffset = new Date(now.getFullYear(), 6, 1).getTimezoneOffset();
    return Math.max(januaryOffset, julyOffset) !== now.getTimezoneOffset();
  };
  
  // PST/PDT offset in hours (negative means behind UTC)
  const pstOffset = isDST() ? -7 : -8;
  // Get local offset in hours (negative means behind UTC)
  const localOffset = -now.getTimezoneOffset() / 60;
  // Calculate the difference between local time and PST
  const hourDifference = localOffset - pstOffset;
  
  // Set the check time in local timezone
  localTime.setHours(CHECK_HOUR_PST + hourDifference);
  localTime.setMinutes(0);
  localTime.setSeconds(0);
  localTime.setMilliseconds(0);
  
  // If the calculated time is in the past for today, schedule for tomorrow
  if (localTime < now) {
    localTime.setDate(localTime.getDate() + 1);
  }
  
  return localTime;
};

/**
 * Calculate milliseconds until next check time
 * @returns Number of milliseconds until the next scheduled check
 */
export const getMillisecondsUntilNextCheck = (): number => {
  const nextCheckTime = getPSTCheckTimeInLocalTime();
  const now = new Date();
  return nextCheckTime.getTime() - now.getTime();
};
