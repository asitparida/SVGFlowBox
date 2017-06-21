/// <reference path="../node_modules/@types/d3/index.d.ts" />
var DEFAULTS = {
    DefaultAnchorNodeSpacing: 300,
    DefaultCurveStroke: '#6dc1ff',
    ShowPlanarMid: false
};
var FlowBox = (function () {
    function FlowBox(_container) {
        this.anchors = [];
        this.lastAnchorAtLength = null;
        this.curveAnchors = [];
        this.lastCurveAnchor = null;
        var self = this;
        self.container = _container;
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
            self.curveAnchors.push([0, self.planarY]);
            self.lastCurveAnchor = [0, self.planarY];
        }
        var x, y;
        var heightDiffer = self.containerHeight / 4;
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY - heightDiffer);
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY + heightDiffer);
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY - heightDiffer);
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY + heightDiffer);
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY);
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
        });
        self.curve && self.curve.remove();
        self.curve = self.svg.append('path')
            .data([self.curveAnchors])
            .attr('d', d3.line().curve(d3.curveCardinal))
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
        var _totalPathLength = self.curve.node().getTotalLength();
        if (!self.lastAnchorAtLength) {
            self.lastAnchorAtLength = 0;
            self.lastAnchorAtLength = self.lastAnchorAtLength + DEFAULTS.DefaultAnchorNodeSpacing / 3;
        }
        else {
            self.lastAnchorAtLength = self.lastAnchorAtLength + DEFAULTS.DefaultAnchorNodeSpacing;
        }
        if (self.lastAnchorAtLength > _totalPathLength) {
            self.extendPlanarCurve();
        }
        var _anchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
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
            var eventBox = self.container.append('div');
            eventBox.node().classList.add('flow-box-event-container');
            eventBox.node().style.top = (_anchor['y'] > self.planarY ? _anchor['y'] - 150 : _anchor['y'] + 20) + 'px';
            eventBox.node().style.left = (_anchor['x'] - 100) + 'px';
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
document.addEventListener('DOMContentLoaded', function () {
    var _containerElm = document.getElementById('container');
    _containerElm.style.display = 'BLOCK';
    _containerElm.style.overflowY = 'hidden';
    _containerElm.style.height = '100%';
    _containerElm.style.width = '100%';
    var _container = d3.select('#' + 'container');
    var _box = new FlowBox(_container);
    var _btn = document.getElementById('addBtn');
    if (_btn) {
        _btn.addEventListener('click', function () {
            _box.addAnchor();
        });
    }
});
