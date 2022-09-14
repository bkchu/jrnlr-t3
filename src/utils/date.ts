import { intervalToDuration } from "date-fns";

export const getDurationSinceDate = (date: Date) => {
  const duration = intervalToDuration({
    start: date,
    end: Date.now(),
  });

  if (duration.years) {
    return `${duration.years}y ago`;
  }
  if (duration.months) {
    return `${duration.months}m ago`;
  }
  if (duration.weeks) {
    return `${duration.weeks}w ago`;
  }
  if (duration.days) {
    return `${duration.days}d ago`;
  }
  if (duration.hours) {
    return `${duration.hours}h ago`;
  }
  if (duration.minutes) {
    return `${duration.minutes}m ago`;
  }
  if (duration.seconds) {
    return `${duration.seconds}s ago`;
  }

  return `Just now`;
};
