/// <reference path="../node_modules/@types/d3/index.d.ts" />
var DEFAULTS = {
    DefaultAnchorNodeSpacing: 50,
    DefaultCurveStroke: '#6dc1ff',
    ShowPlanarMid: false,
    ShowCurveAnchors: false
};
var FlowBox = (function () {
    function FlowBox(_container) {
        this.anchors = [];
        this.lastAnchorAtLength = null;
        this.curveAnchors = [];
        this.lastCurveAnchor = null;
        var self = this;
        self.container = _container;
        self.container.node().classList.add('flow-box-container');
        var _width = self.container.node().getBoundingClientRect().width;
        self.containerWidth = _width;
        var _height = window.innerHeight;
        self.containerHeight = _height * 0.66;
        self.container.node().style.height = self.containerHeight + 'px';
        self.planarY = self.containerHeight * 0.50;
        setTimeout(function () {
            self.svg = self.container.append('svg')
                .attr('width', _width)
                .attr('height', self.containerHeight);
            setTimeout(function () {
                self.extendPlanarCurve();
                DEFAULTS.ShowPlanarMid && self.drawPlanarMidLine();
            });
        });
    }
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
            DEFAULTS.ShowCurveAnchors && self.svg.append('circle')
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
            .attr('stroke', DEFAULTS.DefaultCurveStroke)
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
    FlowBox.prototype.addAnchor = function () {
        var self = this;
        var planarExtended = false;
        var _totalPathLength = self.curve.node().getTotalLength();
        if (!self.lastAnchorAtLength) {
            self.lastAnchorAtLength = 0;
            self.lastAnchor = { 'x': -50, 'y': 0 };
            self.lastAnchorAtLength = self.lastAnchorAtLength + 100;
        }
        else {
            self.lastAnchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
            self.lastAnchorAtLength = self.lastAnchorAtLength + DEFAULTS.DefaultAnchorNodeSpacing;
        }
        var _anchor;
        _anchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
        // MAKE SURE HORIZONTAL DIFF TO LAST ANCHOR IS AT LEAST 100
        if (Math.abs(_anchor['y'] - self.lastAnchor['y']) < 50) {
            var diffToCompare = self.lastAnchorAlignedLeft ? 170 : 100;
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
            self.svg.append('circle')
                .attr('cx', _anchor['x'])
                .attr('cy', _anchor['y'])
                .attr('r', 5)
                .attr('fill', '#0073C6');
            self.svg.append('circle')
                .attr('cx', _anchor['x'])
                .attr('cy', _anchor['y'])
                .attr('r', 10)
                .attr('stroke-width', 3)
                .attr('stroke', '#0073C6')
                .attr('fill', 'none');
            self.anchors.push(_anchor);
            var _anchorNextForSlope = self.curve.node().getPointAtLength(self.lastAnchorAtLength + 1);
            var slope = (_anchorNextForSlope['y'] - _anchor['y']) / (_anchorNextForSlope['x'] - _anchor['x']);
            var top_1, left = void 0;
            if (Math.abs(slope) < 1) {
                top_1 = (slope < 0 ? _anchor['y'] - 130 : _anchor['y'] + 20);
                if ((top_1 + 120 > self.containerHeight) || (top_1 < 0)) {
                    top_1 = (slope < 0 ? _anchor['y'] + 20 : _anchor['y'] - 130);
                }
                // LEFT ADJUSTED BY HALF OF BOX WITH
                left = (_anchor['x'] - 60);
                self.lastAnchorAlignedLeft = false;
            }
            else {
                top_1 = (_anchor['y'] - 100);
                left = (_anchor['x'] + 10);
                self.lastAnchorAlignedLeft = true;
            }
            var eventBox = self.container.append('div');
            eventBox.node().classList.add('flow-box-event-container');
            eventBox.node().style.top = top_1 + 'px';
            eventBox.node().style.left = left + 'px';
            var imgBox = eventBox.append('img');
            imgBox.node().classList.add('flow-box-event-img');
            imgBox.node().src = 'icons-roller-coaster.png';
            var textBox = eventBox.append('p');
            textBox.node().classList.add('flow-box-event-text');
            textBox.node().innerHTML = 'Lorem Ipsum Dolor Sit Amet Sit Dolor Ipsum Lorem';
        }
    };
    return FlowBox;
}());
