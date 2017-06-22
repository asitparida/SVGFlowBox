/// <reference path="../node_modules/@types/d3/index.d.ts" />
var FLOW_DEFAULTS = {
    DefaultAnchorNodeSpacing: 50,
    DefaultCurveColor: '#6dc1ff',
    ShowPlanarMid: false,
    ShowCurveAnchors: false,
    DefaultNodeColor: '#007c6',
    DefaultContainerHeightFraction: 1,
    ShowEventBoxes: true,
    DefaultCurveIsSolid: false,
    DefaultCuveStrokeDasharray: '2, 2'
};
var FlowBoxNode = (function () {
    function FlowBoxNode(lower, upper, color) {
        if (lower === void 0) { lower = ''; }
        if (upper === void 0) { upper = ''; }
        if (color === void 0) { color = FLOW_DEFAULTS.DefaultNodeColor; }
        this.lower = lower;
        this.upper = upper;
        this.nodeColor = color;
    }
    return FlowBoxNode;
}());
var FlowAnchor = (function () {
    function FlowAnchor() {
    }
    return FlowAnchor;
}());
var FlowBox = (function () {
    function FlowBox(defaults, _containerId, nodes) {
        this.anchors = [];
        this.lastAnchorAtLength = null;
        this.curveAnchors = [];
        this.lastCurveAnchor = null;
        var self = this;
        self.DEFAULTS = defaults;
        self.container = d3.select(document.getElementById(_containerId));
        self.container.node().classList.add('flow-box-container');
        var _width = self.container.node().getBoundingClientRect().width;
        self.containerWidth = _width;
        var _height = window.innerHeight;
        if (self.DEFAULTS.DefaultContainerHeightFraction !== 1) {
            self.containerHeight = _height * self.DEFAULTS.DefaultContainerHeightFraction;
            self.container.node().style.height = self.containerHeight + 'px';
        }
        else {
            self.containerHeight = self.container.node().getBoundingClientRect().height;
        }
        self.planarY = self.containerHeight * 0.50;
        setTimeout(function () {
            self.svg = self.container.append('svg')
                .attr('width', _width)
                .attr('height', self.containerHeight);
            setTimeout(function () {
                self.initialize(nodes);
            });
        });
    }
    FlowBox.prototype.initialize = function (nodes) {
        var self = this;
        self.svg.empty();
        self.extendPlanarCurve();
        self.DEFAULTS.ShowPlanarMid && self.drawPlanarMidLine();
        self.initNodes(nodes);
    };
    FlowBox.prototype.initNodes = function (nodes) {
        var self = this;
        nodes.forEach(function (node) {
            self.addAnchor(node);
        });
    };
    FlowBox.prototype.extendPlanarCurve = function () {
        var self = this;
        if (self.lastCurveAnchor == null) {
            self.curveAnchors.push([0, self.planarY + 100]);
            self.lastCurveAnchor = [0, self.planarY + 100];
        }
        var x, y;
        var heightDiffer = self.containerHeight / 5;
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 200, self.planarY - (heightDiffer * 1));
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY - (heightDiffer * 2));
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 50, self.planarY + (heightDiffer * 1.5));
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 200, self.planarY + (heightDiffer * 1.70));
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 200, self.planarY - (heightDiffer * 1.5));
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 200, self.planarY - (heightDiffer * 1.70));
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 50, self.planarY + (heightDiffer));
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 150, self.planarY + (heightDiffer * 1.50));
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 200, self.planarY);
        self.drawPlanarCurve();
    };
    FlowBox.prototype.insertIntoCurveAnchor = function (x, y) {
        var self = this;
        self.curveAnchors.push([x, y]);
        self.lastCurveAnchor = [x, y];
    };
    FlowBox.prototype.drawPlanarCurve = function () {
        var self = this;
        self.curveAnchors.forEach(function (_point) {
            self.containerWidth = self.containerWidth > _point[0] ? self.containerWidth : _point[0];
            self.svg.attr('width', self.containerWidth);
            self.DEFAULTS.ShowCurveAnchors && self.svg.append('circle')
                .attr('cx', _point[0])
                .attr('cy', _point[1])
                .attr('r', 5)
                .attr('fill', '#000');
        });
        self.curve && self.curve.remove();
        self.curve = self.svg.append('path')
            .data([self.curveAnchors])
            .attr('d', d3.line().curve(d3.curveBasis))
            .attr('stroke-width', 2)
            .attr('stroke', self.DEFAULTS.DefaultCurveColor)
            .attr('stroke-dasharray', self.DEFAULTS.DefaultCurveIsSolid === true ? '0, 0' : self.DEFAULTS.DefaultCuveStrokeDasharray)
            .attr('fill', 'none');
    };
    FlowBox.prototype.drawPlanarMidLine = function () {
        var self = this;
        self.planarMidPath = self.svg.append("line")
            .attr('x1', 0)
            .attr('y1', self.planarY)
            .attr('x2', self.containerWidth)
            .attr('y2', self.planarY)
            .attr('stroke-width', 1)
            .attr('stroke', '#e74c3c');
    };
    FlowBox.prototype.addAnchor = function (node) {
        var self = this;
        var _flowAnchor = new FlowAnchor();
        _flowAnchor.data = node;
        var planarExtended = false;
        var _totalPathLength = self.curve.node().getTotalLength();
        if (!self.lastAnchorAtLength) {
            self.lastAnchorAtLength = 0;
            self.lastAnchor = { 'x': -50, 'y': 0 };
            self.lastAnchorAtLength = self.lastAnchorAtLength + 100;
        }
        else {
            self.lastAnchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
            self.lastAnchorAtLength = self.lastAnchorAtLength + self.DEFAULTS.DefaultAnchorNodeSpacing;
        }
        var _anchor;
        _anchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
        // MAKE SURE HORIZONTAL DIFF TO LAST ANCHOR IS AT LEAST 100
        if (Math.abs(_anchor['y'] - self.lastAnchor['y']) < 100) {
            var diffToCompare = self.lastAnchorAlignedLeft ? 220 : 130;
            while (_anchor['x'] - self.lastAnchor['x'] <= diffToCompare) {
                self.lastAnchorAtLength = self.lastAnchorAtLength + 25;
                if (!planarExtended && (self.lastAnchorAtLength > _totalPathLength)) {
                    self.extendPlanarCurve();
                    planarExtended = true;
                }
                _anchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
            }
        }
        if (_anchor) {
            _flowAnchor.anchor = _anchor;
            _flowAnchor.innerNode = self.svg.append('circle')
                .attr('cx', _anchor['x'])
                .attr('cy', _anchor['y'])
                .attr('r', 5)
                .attr('fill', node.nodeColor);
            _flowAnchor.outerNode = self.svg.append('circle')
                .attr('cx', _anchor['x'])
                .attr('cy', _anchor['y'])
                .attr('r', 10)
                .attr('stroke-width', 3)
                .attr('stroke', node.nodeColor)
                .attr('fill', 'none');
            var _anchorNextForSlope = self.curve.node().getPointAtLength(self.lastAnchorAtLength + 1);
            var slope = (_anchorNextForSlope['y'] - _anchor['y']) / (_anchorNextForSlope['x'] - _anchor['x']);
            var top_1, left = void 0;
            var position = '';
            if (Math.abs(slope) < 1) {
                var topOffset = self.DEFAULTS.ShowEventBoxes ? 145 : 130;
                var bottomOffset = self.DEFAULTS.ShowEventBoxes ? 25 : 10;
                top_1 = (slope < 0 ? _anchor['y'] - topOffset : _anchor['y'] + bottomOffset);
                position = slope < 0 ? 'top' : 'bottom';
                if ((top_1 + 120 > self.containerHeight) || (top_1 < 0)) {
                    top_1 = (slope < 0 ? _anchor['y'] + bottomOffset : _anchor['y'] - topOffset);
                    position = slope < 0 ? 'bottom' : 'top';
                }
                // LEFT ADJUSTED BY HALF OF BOX WITH
                left = (_anchor['x'] - 60);
                self.lastAnchorAlignedLeft = false;
            }
            else {
                var leftOffset = self.DEFAULTS.ShowEventBoxes ? 30 : 15;
                top_1 = (_anchor['y'] - 70);
                left = (_anchor['x'] + leftOffset);
                self.lastAnchorAlignedLeft = true;
                position = 'right';
            }
            _flowAnchor.eventBoxPosition = position;
            _flowAnchor.eventBox = self.container.append('div');
            _flowAnchor.eventBox.node().classList.add('flow-box-event-container');
            _flowAnchor.eventBox.node().style.top = top_1 + 'px';
            _flowAnchor.eventBox.node().style.left = left + 'px';
            _flowAnchor.upperBox = _flowAnchor.eventBox.append('div');
            _flowAnchor.upperBox.node().innerHTML = node.upper;
            _flowAnchor.lowerBox = _flowAnchor.eventBox.append('div');
            _flowAnchor.lowerBox.node().classList.add('flow-box-event-text');
            _flowAnchor.lowerBox.node().innerHTML = node.lower;
            if (self.DEFAULTS.ShowEventBoxes) {
                var arrowInBox = _flowAnchor.eventBox.append('div');
                _flowAnchor.eventBox.attr('data-color', node.nodeColor);
                _flowAnchor.eventBox.node().style.background = LightenDarkenColor(node.nodeColor, 120);
                _flowAnchor.eventBox.node().style.borderColor = node.nodeColor;
                arrowInBox.node().classList.add(position + '-side-arrow');
                if (position === 'top')
                    arrowInBox.node().style.borderTopColor = node.nodeColor;
                else if (position === 'bottom')
                    arrowInBox.node().style.borderBottomColor = node.nodeColor;
                else if (position === 'right')
                    arrowInBox.node().style.borderRightColor = node.nodeColor;
                _flowAnchor.lowerBox.node().style.background = node.nodeColor;
                _flowAnchor.lowerBox.node().style.color = '#FFF';
            }
            self.anchors.push(_flowAnchor);
        }
    };
    FlowBox.prototype.reset = function () {
        console.log('reset');
        var self = this;
        self.lastAnchorAtLength = null;
        self.anchors.forEach(function (anchor) {
            anchor.innerNode.remove();
            anchor.outerNode.remove();
            anchor.lowerBox.remove();
            anchor.upperBox.remove();
            anchor.eventBox.remove();
        });
        self.anchors = [];
        self.initialize([]);
    };
    FlowBox.prototype.getNodes = function () {
        var self = this;
        return self.anchors.map(function (anchor) { return anchor.data; });
    };
    return FlowBox;
}());
function LightenDarkenColor(col, amt) {
    var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    var num = parseInt(col, 16);
    var r = (num >> 16) + amt;
    if (r > 255)
        r = 255;
    else if (r < 0)
        r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255)
        b = 255;
    else if (b < 0)
        b = 0;
    var g = (num & 0x0000FF) + amt;
    if (g > 255)
        g = 255;
    else if (g < 0)
        g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
