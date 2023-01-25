import { intervalToDuration } from "date-fns";

export const getDurationSinceDate = (date: Date) => {
  const duration = intervalToDuration({
    start: date,
    end: Date.now(),
  });

  const normalDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  if (duration.years) {
    return normalDate;
  }
  if (duration.months) {
    return normalDate;
  }
  if (duration.weeks) {
    return normalDate;
  }
  if (duration.days) {
    return normalDate;
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
