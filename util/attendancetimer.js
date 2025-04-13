async function attendance_timer(daily_attendance) {
  const daily_minutes = (24 * 60);

  const timeframes = Math.floor(daily_minutes / daily_attendance);

  let miliseconds = timeframes * 60 * 1000;

  console.log(`Timeframe: ${timeframes}`)

  return miliseconds;
  
}

module.exports = attendance_timer;