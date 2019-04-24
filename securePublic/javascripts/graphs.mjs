export function drawGauge(ctx, x, y, value, title, max, min = 0, color = [[100, '#ff0000'], [90, '#ffff00'], [0, '#00ff00']]) {
    if (value == undefined) {
        value = 0;
    }
    if (max == undefined) {
        max = 100;
    }
    let scaledValue = ((value - min) / (max - min) * 100);
    let rad = 25;
    ctx.fillStyle = 'black';
    ctx.font = "bold 12px Arial";
    ctx.fillText(title, x - ((ctx.measureText(title).width / 2)), y - rad - 10);
    ctx.font = "bold 16px Arial";
    ctx.fillText(value, x - ((ctx.measureText(value).width / 2)), y + 5);
    ctx.lineWidth = 15;
    // draw red
    ctx.beginPath();
    //ctx.strokeStyle = (scaledValue< 90)?'#00ff00':'#ff0000';
    ctx.strokeStyle = setColor(scaledValue, color);
    ctx.arc(x, y, rad, drawValue(0), drawValue(100));
    ctx.stroke();
    ctx.beginPath();
    ctx.strokeStyle = '#000000';
    ctx.arc(x, y, rad, drawValue(scaledValue), 2.25 * Math.PI);
    ctx.stroke();


    function drawValue(d) {
        //scale d
        if (d > 100) d = 100;
        return ((d / 100) * Math.PI * 1.5) + Math.PI * .75;
    }
}


export function test() {
    console.log('test - here');
}


function setColor(d, color) {
    for (let i = 0; i < color.length; ++i) {
        if (d > color[i][0]) {
            return color[i][1];
        }
    }
}