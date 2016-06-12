/**
 * Created by sulvto on 16-6-11.
 */

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
    mapList = mapElement.children;
}

function addEventListener() {
    mapElement.addEventListener('contextmenu', function (e) {
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
                start();
            }

        }
        e.preventDefault();
    });
    mapElement.addEventListener('mousemove', function (e) {
        var target = e.target;
        if (dragging && e.button === 0 && target.tagName === 'SPAN' && !target.className) {
            target.className = 'obstacle';
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

function drawSteps(path) {
    if (path.length > 0) {
        var step = path[0];
        mapList[WIDTH * step.y + step.x].className = 'step';
        setTimeout(function () {
            path.shift();
            drawSteps(path);
        }, 10);
    }
}

function start() {
    var steps = mapElement.querySelectorAll('span.step');
    for (var i = 0; i < steps.length; i++) {
        steps[i].className = '';
    }

    var path = aStarSearch({x: from.x, y: from.y}, {x: to.x, y: to.y}, map);
    if (path) {
        drawSteps(path);
    }

}

// A star search algorithm
// https://en.wikipedia.org/wiki/A*_search_algorithm
function aStarSearch(from, to, map) {
    var ORTHOGONAL = 10;
    var DIAGONAL = 14;

    var width = map.length;
    var height = map[0].length;

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

    // Math.abs(x) 函数返回指定数字 x 的绝对值。
    // Math.sqrt(x) 方法可返回 x 的平方根。
    // Math.pow(x,y) 方法可返回 x 的 y 次幂的值。

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
            if (node.walkable && !isClosed(node) && !isOpen(node)) {
                node.parent = parent;
                left = node;
                node.g = parent.g + ORTHOGONAL;
                var h = Math.sqrt(Math.pow(Math.abs(node.x - to.x), 2) + Math.pow(Math.abs(node.y - to.y), 2));
                // F = H + G
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // RIGHT
        if (parent.x < width - 1) {
            var node = map[parent.x + 1][parent.y];
            if (node.walkable && !isClosed(node) && !isOpen(node)) {
                node.parent = parent;
                right = node;
                node.g = parent.g + ORTHOGONAL;
                var h = Math.sqrt(Math.pow(Math.abs(node.x - to.x), 2) + Math.pow(Math.abs(node.y - to.y), 2));
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // UP
        if (parent.y > 0) {
            var node = map[parent.x][parent.y - 1];
            if (node.walkable && !isClosed(node) && !isOpen(node)) {
                node.parent = parent;
                up = node;
                node.g = parent.g + ORTHOGONAL;
                var h = Math.sqrt(Math.pow(Math.abs(node.x - to.x), 2) + Math.pow(Math.abs(node.y - to.y), 2));
                node.f = h + node.g;
                surroundList.push(node);
            }
        }
        // DOWN
        if (parent.y < height - 1) {
            var node = map[parent.x][parent.y + 1];
            if (node.walkable && !isClosed(node) && !isOpen(node)) {
                node.parent = parent;
                down = node;
                node.g = parent.g + ORTHOGONAL;
                var h = Math.sqrt(Math.pow(Math.abs(node.x - to.x), 2) + Math.pow(Math.abs(node.y - to.y), 2));
                node.f = h + node.g;
                surroundList.push(node);
            }
        }
        // UPLEFT
        if ((up || left ) && parent.x > 0 && parent.y > 0) {
            var node = map[parent.x - 1][parent.y - 1];
            if (node.walkable && !isClosed(node) && !isOpen(node)) {
                node.parent = parent;
                node.g = parent.g + DIAGONAL;
                var h = Math.sqrt(Math.pow(Math.abs(node.x - to.x), 2) + Math.pow(Math.abs(node.y - to.y), 2));
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // DOWNLEFT
        if ((down || left) && parent.x > 0 && parent.y < height - 1) {
            var node = map[parent.x - 1][parent.y + 1];
            if (node.walkable && !isClosed(node) && !isOpen(node)) {
                node.parent = parent;
                node.g = parent.g + DIAGONAL;
                var h = Math.sqrt(Math.pow(Math.abs(node.x - to.x), 2) + Math.pow(Math.abs(node.y - to.y), 2));
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // UPRIGHT
        if ((up || right) && parent.x < width - 1 && parent.y > 0) {
            var node = map[parent.x + 1][parent.y - 1];
            if (node.walkable && !isClosed(node) && !isOpen(node)) {
                node.parent = parent;
                node.g = parent.g + DIAGONAL;
                var h = Math.sqrt(Math.pow(Math.abs(node.x - to.x), 2) + Math.pow(Math.abs(node.y - to.y), 2));
                node.f = h + node.g;
                surroundList.push(node);
            }
        }

        // DOWNRIGHT
        if ((down || right) && parent.x < width - 1 && parent.y < height - 1) {
            var node = map[parent.x + 1][parent.y + 1];
            if (node.walkable && !isClosed(node) && !isOpen(node)) {
                node.parent = parent;
                node.g = parent.g + DIAGONAL;
                node.h = Math.sqrt(Math.pow(Math.abs(node.x - to.x), 2) + Math.pow(Math.abs(node.y - to.y), 2));
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
                path = path.reverse();
                path.shift();
                return path;
            }

            openList.push(item);
        }

        pushClosedList(current);
    }
    return null;
}

// start
initMap();
addEventListener();

