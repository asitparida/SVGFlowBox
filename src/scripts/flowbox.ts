/// <reference path="../node_modules/@types/d3/index.d.ts" />

const DEFAULTS: any = {
    DefaultAnchorNodeSpacing: 50,
    DefaultCurveStroke: '#6dc1ff',
    ShowPlanarMid: false,
    ShowCurveAnchors: false
}

class FlowBox {
    private eventBoxContainer: any;
    private container: d3.Selection<any, any, null, undefined>;
    private svg: d3.Selection<any, any, null, undefined>;
    private containerWidth: number;
    private containerHeight: number;
    private planarY: number;
    private planarMidPath: d3.Selection<any, any, null, undefined>;
    private curve: d3.Selection<any, any, null, undefined>;
    private anchors: any[] = [];
    private lastAnchorAtLength: any = null;
    private curveAnchors: any = [];
    private lastCurveAnchor: any = null;
    private lastAnchor: any;
    private lastAnchorAlignedLeft: any;
    constructor(_container: d3.Selection<any, any, null, undefined>) {
        const self = this;
        self.container = _container;
        self.container.node().classList.add('flow-box-container');
        let _width = (self.container.node().getBoundingClientRect() as ClientRect).width;
        self.containerWidth = _width;
        let _height = window.innerHeight;
        self.containerHeight = _height * 0.66;
        self.container.node().style.height = self.containerHeight + 'px';
        self.planarY = self.containerHeight * 0.50;
        setTimeout(() => {
            self.svg = self.container.append('svg')
                .attr('width', _width)
                .attr('height', self.containerHeight);
            setTimeout(() => {
                self.extendPlanarCurve();
                DEFAULTS.ShowPlanarMid && self.drawPlanarMidLine();
            });
        })
    }
    extendPlanarCurve() {
        const self = this;
        if (self.lastCurveAnchor == null) {
            self.curveAnchors.push([0, self.planarY + 100]);
            self.lastCurveAnchor = [0, self.planarY + 100];
        }
        let x, y;
        let heightDiffer = self.containerHeight / 5;
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
    }
    insertIntoCurveAnchor(x: number, y: number) {
        const self = this;
        self.curveAnchors.push([x, y]);
        self.lastCurveAnchor = [x, y];
    }
    drawPlanarCurve() {
        const self = this;
        self.curveAnchors.forEach((_point: any) => {
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
            .attr('fill', 'none')
    }
    drawPlanarMidLine() {
        const self = this;
        self.planarMidPath = self.svg.append("line")
            .attr('x1', 0)
            .attr('y1', self.planarY)
            .attr('x2', self.containerWidth)
            .attr('y2', self.planarY)
            .attr('stroke-width', 1)
            .attr('stroke', '#e74c3c');
    }
    addAnchor() {
        const self = this;
        let planarExtended = false;
        let _totalPathLength = self.curve.node().getTotalLength();
        if (!self.lastAnchorAtLength) {
            self.lastAnchorAtLength = 0;
            self.lastAnchor = { 'x': -50, 'y': 0 };
            self.lastAnchorAtLength = self.lastAnchorAtLength + 100;
        } else {
            self.lastAnchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
            self.lastAnchorAtLength = self.lastAnchorAtLength + DEFAULTS.DefaultAnchorNodeSpacing;
        }
        let _anchor;
        _anchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
        // MAKE SURE HORIZONTAL DIFF TO LAST ANCHOR IS AT LEAST 100
        if (Math.abs(_anchor['y'] - self.lastAnchor['y']) < 50) {
            let diffToCompare = self.lastAnchorAlignedLeft ? 170 : 100;
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
            let _anchorNextForSlope = self.curve.node().getPointAtLength(self.lastAnchorAtLength + 1);
            let slope = (_anchorNextForSlope['y'] - _anchor['y']) / (_anchorNextForSlope['x'] - _anchor['x']);
            let top, left;
            if (Math.abs(slope) < 1) {
                top = (slope < 0 ? _anchor['y'] - 130 : _anchor['y'] + 20);
                if ((top + 120 > self.containerHeight) || (top < 0)) {
                    top = (slope < 0 ? _anchor['y'] + 20 : _anchor['y'] - 130);
                }
                // LEFT ADJUSTED BY HALF OF BOX WITH
                left = (_anchor['x'] - 60);
                self.lastAnchorAlignedLeft = false;
            } else {
                top = (_anchor['y'] - 100);
                left = (_anchor['x'] + 10);
                self.lastAnchorAlignedLeft = true;
            }
            let eventBox: d3.Selection<any, any, null, undefined> = self.container.append('div');
            eventBox.node().classList.add('flow-box-event-container');
            eventBox.node().style.top = top + 'px';
            eventBox.node().style.left = left + 'px';
            let imgBox: d3.Selection<any, any, null, undefined> = eventBox.append('img');
            imgBox.node().classList.add('flow-box-event-img');
            imgBox.node().src = 'icons-roller-coaster.png';
            let textBox: d3.Selection<any, any, null, undefined> = eventBox.append('p');
            textBox.node().classList.add('flow-box-event-text');
            textBox.node().innerHTML = 'Lorem Ipsum Dolor Sit Amet Sit Dolor Ipsum Lorem';
        }
    }
}