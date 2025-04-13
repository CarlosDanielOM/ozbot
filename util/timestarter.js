function startTime(daily_attendance) {
  let now = new Date();
  let totalMinutes = now.getHours() * 60 + now.getMinutes();
  let intervalMinutes = (24 * 60) / daily_attendance;
  let nextCheckpointMinutes = Math.floor(totalMinutes / intervalMinutes) * intervalMinutes + intervalMinutes;
  if (nextCheckpointMinutes >= 1440) {
    nextCheckpointMinutes = 0;
  }
  let diffInMinutes = nextCheckpointMinutes - totalMinutes;
  if (diffInMinutes < 0) diffInMinutes += 1440;
  return diffInMinutes * 60 * 1000;
}

module.exports = { startTime };