export function drawGauge(ctx, x, y, value, title) {

    if (value == undefined) {
        value = 0
    }
    var rad = 25;
    ctx.fillStyle = 'black';
    ctx.font = "bold 12px Arial";
    ctx.fillText(title, x - ((ctx.measureText(title).width / 2)), y - rad - 10);
    ctx.font = "bold 16px Arial";

    ctx.fillText(value, x - ((ctx.measureText(value).width / 2)), y + 5);
    ctx.lineWidth = 15;

    // draw red
    ctx.beginPath();
    ctx.strokeStyle = (value< 75)?'#00ff00':'#ff0000';
    ctx.arc(x, y, rad, drawValue(0), drawValue(100));
    ctx.stroke();


    ctx.beginPath();
    ctx.strokeStyle = '#000000';

    ctx.arc(x, y, rad, drawValue(value), 2.25 * Math.PI);
    ctx.stroke();

    function drawValue(d) {
    if (d>100)d=100;
        return ((d / 100) * Math.PI * 1.5) + Math.PI * .75
    }
}


export function test() {
    console.log('test - here')
}