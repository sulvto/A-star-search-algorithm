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
    }

    var from = {x: from.x, y: from.y};
    var to = {x: to.x, y: to.y};

    var path = aStarSearch(from, to, map);
    if (path) {
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

function aStarSearch(from, to, map) {
    var ORTHOGONAL = 10;
    var DIAGONAL = 14;

    var height = map.length;
    var width = map[0].length;

    var openList = [];
    var closedList = [];

    function isOpen(node) {
        for (var i = 0; i < openList.length; i++) {
            var item = openList[i];
            if (item.x == node.x && item.y == node.y) {
                return true;
            }
        }
        return false;
    }

    function isClosed(node) {
        return closedList[node.x] && closedList[node.x][node.y];
    }

    function pushClosedList(node) {
        if (!closedList[node.x]) {
            closedList[node.x] = [];
        }
        closedList[node.x][node.y] = node;
    }

    //  (x-1,y-1) (x,y-1) (x+1,y-1)
    //   (x-1,y)   (x,y)   (x+1,y)
    //  (x-1,y+1) (x,y+1) (x+1,y+1)

    //  UPLEFT     UP     UPRIGHT
    //  LEFT     parent     RIGHT
    //  DOWNLEFT  DOWN  DOWNRIGHT

    // Math.abs(x) 函数返回指定数字“x“ 的绝对值

    // F = G + H

    // * G = 从起点A，沿着产生的路径，移动到网格上指定方格的移动耗费。
    // * H = 从网格上那个方格移动到终点B的预估移动耗费

    function getSurroundNode(parent) {
        var surroundList = [];
        var up = null;
        var down = null;
        var left = null;
        var right = null;

        if (!parent.g) {
            parent.g = 0;
        }
        // LEFT
        if (parent.x > 0) {
            var node = map[parent.x - 1][parent.y];
            if (node.walkable && !isClosed(node)) {
                node.parent = parent;
                left = node;
                node.g = parent.g + ORTHOGONAL;
                var h = ORTHOGONAL * Math.abs(node.x - to.x) + Math.abs(node.y - to.y);
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // RIGHT
        if (parent.x <= width) {
            var node = map[parent.x + 1][parent.y];
            if (node.walkable && !isClosed(node)) {
                node.parent = parent;
                right = node;
                node.g = parent.g + ORTHOGONAL;
                var h = ORTHOGONAL * Math.abs(node.x - to.x) + Math.abs(node.y - to.y);
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // UP
        if (parent.y > 0) {
            var node = map[parent.x][parent.y - 1];
            if (node.walkable && !isClosed(node)) {
                node.parent = parent;
                up = node;
                node.g = parent.g + ORTHOGONAL;
                var h = ORTHOGONAL * Math.abs(node.x - to.x) + Math.abs(node.y - to.y);
                node.f = h + node.g;
                surroundList.push(node);
            }
        }
        // DOWN
        if (parent.y <= height) {
            var node = map[parent.x][parent.y + 1];
            if (node.walkable && !isClosed(node)) {
                node.parent = parent;
                down = node;
                node.g = parent.g + ORTHOGONAL;
                var h = ORTHOGONAL * Math.abs(node.x - to.x) + Math.abs(node.y - to.y);
                node.f = h + node.g;
                surroundList.push(node);
            }
        }
        // UPLEFT
        if ((up || left ) && parent.x > 0 && parent.y > 0) {
            var node = map[parent.x - 1][parent.y - 1];
            if (node.walkable && !isClosed(node)) {
                node.parent = parent;
                node.g = parent.g + DIAGONAL;
                var h = ORTHOGONAL * Math.abs(node.x - to.x) + Math.abs(node.y - to.y);
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // DOWNLEFT
        if ((down || left) && parent.x > 0 && parent.y <= height) {
            var node = map[parent.x - 1][parent.y + 1];
            if (node.walkable && !isClosed(node)) {
                node.parent = parent;
                node.g = parent.g + DIAGONAL;
                var h = ORTHOGONAL * Math.abs(node.x - to.x) + Math.abs(node.y - to.y);
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // UPRIGHT
        if ((up || right) && parent.x <= width && parent.y > 0) {
            var node = map[parent.x + 1][parent.y - 1];
            if (node.walkable && !isClosed(node)) {
                node.parent = parent;
                node.g = parent.g + DIAGONAL;
                var h = ORTHOGONAL * Math.abs(node.x - to.x) + Math.abs(node.y - to.y);
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // DOWNRIGHT
        if ((down || right) && parent.x <= width && parent.y <= height) {
            var node = map[parent.x + 1][parent.y + 1];
            if (node.walkable && !isClosed(node)) {
                node.parent = parent;
                node.g = parent.g + DIAGONAL;
                node.h = ORTHOGONAL * Math.abs(node.x - to.x) + Math.abs(node.y - to.y);
                node.f = node.h + node.g;
                surroundList.push(node);
            }
        }

        return surroundList;
    }

    openList.push(from);

    for (; openList.length;) {
        var current = openList.sort(function (a, b) {
            return b.f - a.f;
        }).pop();
        var surroundNode = getSurroundNode(current);
        for (var i = 0; i < surroundNode.length; i++) {
            var item = surroundNode[i];
            if (item.x === to.x && item.y === to.y) {
                var path = [];
                var parent = item.parent;
                while (parent) {
                    path.push(parent);
                    parent = parent.parent;
                }
                return path.reverse();
            }
            if (!isOpen(item)) {
                openList.push(item);
            }
        }

        pushClosedList(current);
    }
    return null;
}

initMap();
addEventListener();

