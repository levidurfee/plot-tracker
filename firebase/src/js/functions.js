export function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function calcTargetEligility(numberOfPlots) {
    const odds = 0.001953125;
    return (100 * (odds*numberOfPlots)).toFixed(2);
}
