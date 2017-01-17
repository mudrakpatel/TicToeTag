var canvas;
var context;
var width;
var height;

var xBoard = 0;
var oBoard = 0;
var begin = true;

function drawBoard() {
    context.beginPath();
    context.strokeStyle = 'black';
    context.lineWidth = 4;

    var vl1 = Math.round(width / 3);
    var vl2 = Math.round(vl1*2);
    var hl1 = Math.round(height / 3);
    var hl2 = Math.round(hl1*2);

    context.moveTo(vl1, 0);
    context.lineTo(vl1, height);

    context.moveTo(vl2, 0);
    context.lineTo(vl2, height);

    context.moveTo(0, hl1);
    context.lineTo(width, hl1);

    context.moveTo(0, hl2);
    context.lineTo(width, hl2);

    context.stroke();
    context.closePath();

}

function init(canvasID) {
    canvas = document.getElementById(canvasID);
    context = canvas.getContext('2d');
    width=canvas.width;
    height = canvas.height;

    canvas.addEventListener('click', clickHandler);


    drawBoard();
}

function isEmpty(xBoard, oBoard, bit) {
    return (((xBoard & bit) == 0) && ((oBoard & bit) == 0));
}

function drawX(x, y) {
    context.beginPath();
    context.strokeStyle = '#ff0000';
    context.lineWidth = 4;

    var ox = (width / 3) * .1;
    var bx = ox + x * (width / 3);
    var ex = -ox + (x + 1) * (width / 3);

    var oy = (height / 3) * .1;
    var by = oy + y * (height / 3);
    var ey = -oy + (y + 1) * (height / 3);



    context.moveTo(bx, by);
    context.lineTo(ex, ey);

    context.moveTo(bx, ey);
    context.lineTo(ex, by);


    context.stroke();
    context.closePath();

}


function markBit(markBit, player) {
    var bit = 1;
    var x = 0;
    var y = 0;

    while ((markBit & bit) == 0) {
        bit = bit << 1;
        x++;
        if (x > 2) {
            x = 0;
            y++;
        }
    }
    if (player === 'O') {
        oBoard = oBoard | bit;
        drawO(x, y);
    } else {
        xBoard = xBoard | bit;
        drawX(x, y);
    }
}
var score = {
    win: 0,
    lost: 0,
    tie:0
};




function clickHandler(event) {
    var x = Math.floor((event.clientX-canvas.offsetLeft)/(width/3));
    var y = Math.floor((event.clientY - canvas.offsetTop) / (height / 3));

    var bit = (1 << x + (y * 3));

    console.log('ch:x=' + x + " ,y=" + y + " ,b=" + bit);
    if (isEmpty(xBoard, oBoard, bit)) {
        markBit(bit, 'X');
        if (!checkTie()) {
            if (checkWinner(xBoard)) {
                alert('You Win!');
                score.win++;
                restart();
            } else {
                play();
                if (!checkTie()) {
                    if (checkWinner(oBoard)) {
                        alert('You Lost!');
                        score.lost++;
                        restart();
                    }
                } else {
                    score.tie++;
                }

            }
        } else {
            score.tie++;
        }



    } else {
        alert('cell occupied');
    }
}

function incrementScores() {
    document.getElementById('wins').innerHTML = score.win;
    document.getElementById('losses').innerHTML = score.lost;
    document.getElementById('ties').innerHTML = score.tie;

}

function checkWinner(board) {
    var winState = false;
    if(
        ((board | 0x1C0) === board)
        || ((board | 0x38) === board)
        || ((board | 0x7) === board)
        || ((board | 0x124) === board)
        || ((board | 0x92) === board)
        || ((board | 0x49) === board)
        || ((board | 0x111) === board)
        || ((board | 0x54) === board)
        )
    {
        winState=true;
    }
    return winState;
}

function calculateRatio(oBoard, xBoard, player, bit, ratio) {
    var best;
    if (player === 'O') {
        oBoard = oBoard | bit;

    } else {
        xBoard = xBoard | bit;
    }

    if (checkWinner(oBoard)) {
        ratio *= 1.1;
        best = ratio;
    } else if (checkWinner(xBoard)) {
        ratio *= 0.7;
        best = ratio;
    } else {
        best = 0;
        ratio *= .6;
    }

    for (var i = 0; i < 9; i++) {
        if (isEmpty(xBoard, oBoard, 1 << i)) {
            var newPlayer = player == 'O' ? 'X' : 'O';
            var newRatio = calculateRatio(oBoard, xBoard, newPlayer, 1 << i, ratio);
            if (best === 0 || best < newRatio) {
                best = newRatio;
            }
        }
    }

    return best;
}

function simulate(oBoard, xBoard) {
    var ratio = 0;
    var bit = 0;

    for (var i = 0; i < 9; i++) {
        var checkBit = 1 << i;
        if (isEmpty(xBoard, oBoard, checkBit)) {
            if (checkWinner(oBoard | checkBit)) {
                bit = checkBit;
                break;
            } else if (checkWinner(xBoard | checkBit)) {
                bit = checkBit;
            }
        }
    }

    if (bit === 0) {
        for (var i = 0; i < 9; i++) {
            var checkBit = 1 << i;
            if (isEmpty(xBoard, oBoard, checkBit)) {
                var result = calculateRatio(oBoard, xBoard, 'X', 0, 1);
                if (ratio === 0 || ratio < result) {
                    ratio = result;
                    bit = checkBit;
                }
            }
        }

    }
    return bit;
}


function restart() {
    incrementScores();
    context.clearRect(0, 0, width, height);
    xBoard = 0;
    oBoard = 0;
    drawBoard();

}

function checkTie() {
    var tie = false;
    if ((xBoard | oBoard) === 0x1ff) {
        restart();
        tie = true;
        //score.tie++;
    }
    return tie;
}

function play() {
    var bestPlay = simulate(oBoard, xBoard);
    markBit(bestPlay, 'O');
}

function drawO(x, y) {
    context.beginPath();
    context.strokeStyle = '#0000ff';
    context.lineWidth = 10;

    var ox = (width / 3) * .1;
    var bx = ox + x * (width / 3);
    var ex = -ox + (x + 1) * (width / 3);

    var oy = (height / 3) * .1;
    var by = oy + y * (height / 3);
    var ey = -oy + (y + 1) * (height / 3);

    console.log("drawO:ox=" + ox + ", bx=" + bx + ", ex=" + ex);
    console.log("drawO:oy=" + oy + ", by=" + by + ", ey=" + ey);

    /*
    context.moveTo(bx, by);
    context.lineTo(ex, ey);

    context.moveTo(bx, ey);
    context.lineTo(ex, by);
    */
    var rx = (ex - bx - ox) / 2;
    var ry = (ey - by - oy) / 2;
    var r = (rx > ry) ? ry : rx;
    
    context.arc(
        bx+(ex-bx)/2,
        by+(ey-by)/2,
        r,
        0,
        Math.PI*2,
        true
        );

    context.stroke();
    context.closePath();

}
