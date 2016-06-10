console.log('Hello World');
var HEIGHT = 40;
var WIDTH = 60;
var SIDE = 12;

var dragging = false;
var from = null;
var to = null;
var map = [];
var mapList = [];

var mapElement = document.getElementById('map');

function initMap() {
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < HEIGHT; i++) {
        for (var j = 0; j < WIDTH; j++) {
            map[j] = map[j] || [];
            var span = document.createElement("span");
            span.x = j;
            span.y = i;
            span.style.height = span.style.width = SIDE - 1 + 'px';
            span.style.top = i * SIDE + 'px';
            span.style.left = j * SIDE + 'px';
            map[j][i] = {x: j, y: i, walkable: true};
            fragment.appendChild(span);
        }
    }
    mapElement.appendChild(fragment);
    mapElement.style.height = HEIGHT * SIDE - 1 + 'px';
    mapElement.style.width = WIDTH * SIDE - 1 + 'px';
    var mapList = mapElement.children;
}

function addEventListener() {
    mapElement.addEventListener('contextmenu', function (e) {
        console.log('contextmenu');
        var target = e.target;
        if (target.tagName === 'SPAN') {
            map[target.x][target.y].walkable = true;

            if (from === null) {
                target.className = 'from';
                from = target;
            } else {
                if (to !== null) {
                    from.classList.remove('from');
                    to.className = 'from';
                    target.className = 'to';
                    from = to;
                }
                target.className = 'to';
                to = target;
                drawPath();
            }

        }
        e.preventDefault();
    });
    mapElement.addEventListener('mousemove', function (e) {
        var target = e.target;
        if (dragging && e.button === 0 && target.tagName === 'SPAN' && !target.className) {
            target.className = 'obstacle';
            console.log(target);
            map[target.x][target.y].walkable = false;
        }
    }, false);
    mapElement.addEventListener('mousedown', function (e) {
        if (e.button === 0 && e.target.tagName === 'SPAN') {
            dragging = true;
        }
    }, false);
    document.addEventListener('mouseup', function (e) {
        if (e.button === 0) {
            dragging = false;
        }
    }, false);
}

function drawPath() {
    var steps = mapElement.querySelectorAll('span.step');
    console.log(steps);
    if (steps.length > 0) {


        steps.forEach(function (step) {
            step.className = '';
        });

        var from = {x: from.x, y: from.y};
        var to = {x: to.x, y: to.y};

        var path = aStarSearch(from, to, map);

        drawSteps(path);
    }
}

function drawSteps(path) {
    if (path.length > 0) {
        var step = path[0];
        mapList[WIDTH * step.y + step.x].className = 'step';
        setTimeout(function () {
            drawSteps(path.splice(0, 1));
        }, 800);
    }
}


initMap();
addEventListener();

