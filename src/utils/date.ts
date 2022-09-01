import { intervalToDuration } from "date-fns";

export const getDurationSinceDate = (date: Date) => {
  const duration = intervalToDuration({
    start: date,
    end: Date.now(),
  });

  if (duration.years) {
    return `${duration.years}y`;
  }
  if (duration.months) {
    return `${duration.months}m`;
  }
  if (duration.weeks) {
    return `${duration.weeks}w`;
  }
  if (duration.days) {
    return `${duration.days}d`;
  }
  if (duration.hours) {
    return `${duration.hours}h`;
  }
  if (duration.minutes) {
    return `${duration.minutes}m`;
  }
  if (duration.seconds) {
    return `${duration.seconds}s`;
  }
};
