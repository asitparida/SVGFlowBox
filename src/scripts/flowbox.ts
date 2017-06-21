/// <reference path="../node_modules/@types/d3/index.d.ts" />

const DEFAULTS: any = {
    DefaultAnchorNodeSpacing: 300,
    DefaultCurveStroke: '#6dc1ff',
    ShowPlanarMid: false
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
    constructor(_container: d3.Selection<any, any, null, undefined>) {
        const self = this;
        self.container = _container;
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
            self.curveAnchors.push([0, self.planarY]);
            self.lastCurveAnchor = [0, self.planarY];
        }
        let x, y;
        let heightDiffer = self.containerHeight / 4;
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY - heightDiffer);
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY + heightDiffer);
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY - heightDiffer);
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY + heightDiffer);
        self.insertIntoCurveAnchor(self.lastCurveAnchor[0] + 300, self.planarY);
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
        });
        self.curve && self.curve.remove();
        self.curve = self.svg.append('path')
            .data([self.curveAnchors])
            .attr('d', d3.line().curve(d3.curveCardinal))
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
        let _totalPathLength = self.curve.node().getTotalLength();
        if (!self.lastAnchorAtLength) {
            self.lastAnchorAtLength = 0;
            self.lastAnchorAtLength = self.lastAnchorAtLength + DEFAULTS.DefaultAnchorNodeSpacing / 3;
        } else {
            self.lastAnchorAtLength = self.lastAnchorAtLength + DEFAULTS.DefaultAnchorNodeSpacing;
        }
        if (self.lastAnchorAtLength > _totalPathLength) {
            self.extendPlanarCurve();
        }
        let _anchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
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
            let eventBox: d3.Selection<any, any, null, undefined> = self.container.append('div');
            eventBox.node().classList.add('flow-box-event-container');
            eventBox.node().style.top = (_anchor['y'] > self.planarY ? _anchor['y'] - 150 : _anchor['y'] + 20) + 'px';
            eventBox.node().style.left = (_anchor['x'] - 100) + 'px';
            let imgBox: d3.Selection<any, any, null, undefined> = eventBox.append('img');
            imgBox.node().classList.add('flow-box-event-img');
            imgBox.node().src = 'icons-roller-coaster.png';
            let textBox: d3.Selection<any, any, null, undefined> = eventBox.append('p');
            textBox.node().classList.add('flow-box-event-text');
            textBox.node().innerHTML  = 'Lorem Ipsum Dolor Sit Amet Sit Dolor Ipsum Lorem';
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    let _containerElm = document.getElementById('container');
    _containerElm.style.display = 'BLOCK';
    _containerElm.style.overflowY = 'hidden';
    _containerElm.style.height = '100%';
    _containerElm.style.width = '100%';
    let _container = d3.select('#' + 'container');
    let _box = new FlowBox(_container);
    let _btn = document.getElementById('addBtn');
    if (_btn) {
        _btn.addEventListener('click', function () {
            _box.addAnchor();
        })
    }
});