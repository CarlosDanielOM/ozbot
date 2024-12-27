function startTime() {
    let initialMinutes = 0;
    let now = Date.now();

    let date = new Date(now);
    
    let hours = date.getHours() + 1;
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();

    let remainderHours = hours % 3;
    let remainderMinutes = 60 - minutes;

    console.log({remainderHours, remainderMinutes});

    switch(remainderHours) {
        case 1:
            initialMinutes = remainderMinutes + 120;
            break;
        case 2:
            initialMinutes = remainderMinutes + 60;
            break;
        case 0:
            initialMinutes = remainderMinutes;
            break;
        default:
            break;
    }

    let initialSeconds = initialMinutes * 60;

    let miliseconds = initialSeconds * 1000;

    return miliseconds;
}

module.exports = {
    startTime
};