function endDayTimer() {
    let initialMinutes = 0;
    let now = Date.now();

    let nowDate = new Date(now);
    
    let hours = nowDate.getHours() + 1;
    let minutes = nowDate.getMinutes();

    let endHours = 24 - hours;
    let endMinutes = 60 - minutes;

    let miliseconds = (endHours * 1000 * 60 * 60) + (endMinutes * 1000 * 60);
    
    return miliseconds;
}

module.exports = {
    endDayTimer
};