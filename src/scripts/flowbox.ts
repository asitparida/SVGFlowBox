/// <reference path="../node_modules/@types/d3/index.d.ts" />
/// <reference path="../node_modules/@types/jquery/index.d.ts" />

declare interface ObjectConstructor {
    assign(...objects: Object[]): Object;
}

function debounce(func: any, wait: number, immediate: Boolean) {
    let timeout: any;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

interface IflowDefaults {
    DefaultAnchorNodeSpacing: number,
    DefaultCurveColor: string,
    ShowPlanarMid: Boolean,
    ShowCurveAnchors: Boolean,
    DefaultNodeColor: string,
    DefaultContainerHeightFraction: number,
    ShowEventBoxes: Boolean,
    DefaultCurveIsSolid: Boolean,
    DefaultCuveStrokeDasharray: string,
    TouchEditMode: Boolean,
    EventBoxWidth: number,
    EventBoxHeight: number,
    BaseAnchors: Array<any>,
    EditBaseDistanceChange: number
}

const FLOW_DEFAULTS: IflowDefaults = {
    DefaultAnchorNodeSpacing: 10,
    DefaultCurveColor: '#6dc1ff',
    ShowPlanarMid: false,
    ShowCurveAnchors: false,
    DefaultNodeColor: '#007c6',
    DefaultContainerHeightFraction: 1,
    ShowEventBoxes: true,
    DefaultCurveIsSolid: false,
    DefaultCuveStrokeDasharray: '2, 2',
    TouchEditMode: false,
    EventBoxHeight: 120,
    EventBoxWidth: 180,
    BaseAnchors: [],
    EditBaseDistanceChange: 4
}

class FlowBoxNode {
    lower: string;
    upper: string;
    nodeColor: string;
    nodeData: any;
    constructor(data: any) {
        this.nodeData = data;
        this.lower = data['lower'];
        this.upper = data['upper'];
        this.nodeColor = data['nodeColor'];
        if (typeof this.nodeData.id === 'undefined') {
            this.nodeData.id = GUID();
        }
    }
}

class FlowAnchor {
    anchor: any;
    data: any;
    innerNode: d3.Selection<any, any, null, undefined>;
    outerNode: d3.Selection<any, any, null, undefined>;
    eventBoxPosition: string;
    eventBoxLeft: number;
    anchorDistance: number;
    eventBox: d3.Selection<any, any, null, undefined>;
    upperBox: d3.Selection<any, any, null, undefined>;
    lowerBox: d3.Selection<any, any, null, undefined>;
    arrowInBox: d3.Selection<any, any, null, undefined>;
}

class CurveAnchor {
    index: number = -1;
    anchorBase: AnchorBase;
    data: any;
    anchor: d3.Selection<any, any, null, undefined>;
}

class AnchorBase {
    offsetX: number = 0;
    offsetY: number = 0;
    constructor(x: number, y: number) {
        this.offsetX = x;
        this.offsetY = y;
    }
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
    private anchors: FlowAnchor[] = [];
    private lastAnchorAtLength: any = null;
    private curveAnchors: CurveAnchor[] = [];
    private lastCurveAnchor: any = null;
    private lastAnchor: any;
    private lastAnchorAlignedLeft: any;
    private DEFAULTS: IflowDefaults;
    private captureMouseMove: any;
    private activeCurveAnchor: CurveAnchor;
    private activeFlowAnchor: FlowAnchor;
    private baseAnchors: AnchorBase[];
    private selectionCallBack: (data: any) => void;
    private useDataPostions: Boolean = false;
    private editingBoxPositionInTouchMode: Boolean = false;
    private captureMouseMoveFn: any;
    private lastBoxPositionX = 0;
    constructor(defaults: any, _containerId: string, nodes: FlowBoxNode[], selectionCallBack?: (data: any) => void, useDataPositions: Boolean = false) {
        const self = this;
        self.useDataPostions = useDataPositions;
        self.selectionCallBack = selectionCallBack;
        self.baseAnchors = [];
        self.DEFAULTS = defaults;
        self.container = d3.select(document.getElementById(_containerId));
        self.container.node().classList.add('flow-box-container');
        let _width = (self.container.node().getBoundingClientRect() as ClientRect).width;
        self.containerWidth = _width;
        let _height = window.innerHeight;
        if (self.DEFAULTS.DefaultContainerHeightFraction !== 1) {
            self.containerHeight = _height * self.DEFAULTS.DefaultContainerHeightFraction;
            self.container.node().style.height = self.containerHeight + 'px';
        } else {
            self.containerHeight = self.container.node().getBoundingClientRect().height;
        }
        self.planarY = self.containerHeight * 0.50;
        setTimeout(() => {
            self.svg = self.container.append('svg')
                .attr('width', _width)
                .attr('height', self.containerHeight);
            setTimeout(() => {
                self.populateCurveAnchorBase();
                self.extendPlanarCurve();
                self.initialize(nodes);
            });
        })
    }
    resetCurve() {
        const self = this;
        self.curveAnchors.forEach((anchor: CurveAnchor) => {
            anchor.anchor.remove();
        });
        self.curveAnchors = [];
        self.curve && self.curve.remove();
    }
    initialize(nodes: FlowBoxNode[]) {
        const self = this;
        self.svg.empty();
        self.DEFAULTS.ShowPlanarMid && self.drawPlanarMidLine();
        self.initNodes(nodes);
    }
    initNodes(nodes: FlowBoxNode[]) {
        const self = this;
        nodes.forEach((node: FlowBoxNode) => {
            let _node = new FlowBoxNode(node);
            self.addAnchor(_node, false);
        });
    }
    getBaseAnchors(): any[] {
        return this.DEFAULTS.BaseAnchors;
    }
    populateCurveAnchorBase() {
        const self = this;
        let heightDiffer = self.containerHeight / 5;
        let extremeX = 0;
        self.baseAnchors = [];
        if (self.DEFAULTS.BaseAnchors && self.DEFAULTS.BaseAnchors.length > 0) {
            self.DEFAULTS.BaseAnchors.push();
        } else {
            self.DEFAULTS.BaseAnchors.push([0, 0]);
            self.DEFAULTS.BaseAnchors.push([100, - heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([200, - heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([100, 0]);
            self.DEFAULTS.BaseAnchors.push([100, + heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([200, + heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([100, 0]);
            self.DEFAULTS.BaseAnchors.push([100, - heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([200, - heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([100, 0]);
            self.DEFAULTS.BaseAnchors.push([100, + heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([200, + heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([100, 0]);
            self.DEFAULTS.BaseAnchors.push([100, - heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([200, - heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([100, 0]);
            self.DEFAULTS.BaseAnchors.push([100, + heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([200, + heightDiffer]);
            self.DEFAULTS.BaseAnchors.push([100, 0]);
        }
        self.DEFAULTS.BaseAnchors.forEach((_anc) => {
            self.baseAnchors.push(new AnchorBase(_anc[0], _anc[1]));
        });
    }
    extendPlanarCurve() {
        const self = this;
        if (self.lastCurveAnchor == null) {
            self.lastCurveAnchor = [0, 0];
        }
        self.baseAnchors.forEach((base: AnchorBase, index: number) => {
            self.creatCurveAnchor(index + 1, base);
        });
        self.drawPlanarCurve();
    }
    creatCurveAnchor(index: number, base: AnchorBase) {
        const self = this;
        let curveAnchor = new CurveAnchor();
        curveAnchor.index = index;
        curveAnchor.anchorBase = base;
        let x = self.lastCurveAnchor[0] + base.offsetX;
        let y = self.planarY + base.offsetY;
        curveAnchor.data = [x, y];
        self.lastCurveAnchor = [x, y];
        self.curveAnchors.push(curveAnchor);
    }
    drawPlanarCurve() {
        const self = this;
        self.captureMouseMove = false;
        self.curveAnchors.forEach((_curveAnchor: CurveAnchor) => {
            self.containerWidth = self.containerWidth > _curveAnchor.data[0] ? self.containerWidth : _curveAnchor.data[0];
            self.svg.attr('width', self.containerWidth);
            _curveAnchor.anchor = self.DEFAULTS.ShowCurveAnchors && self.svg.append('circle')
                .attr('cx', _curveAnchor.data[0])
                .attr('cy', _curveAnchor.data[1])
                .attr('r', 5)
                .attr('fill', '#000');
        });
        self.curve && self.curve.remove();
        let _points = self.curveAnchors.map((c: CurveAnchor) => { return c.data });
        self.curve = self.svg.append('path')
            .data([_points])
            .attr('d', d3.line().curve(d3.curveNatural))
            .attr('stroke-width', 2)
            .attr('stroke', self.DEFAULTS.DefaultCurveColor)
            .attr('stroke-dasharray', self.DEFAULTS.DefaultCurveIsSolid === true ? '0, 0' : self.DEFAULTS.DefaultCuveStrokeDasharray)
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
    addAnchor(node: FlowBoxNode, scroll: Boolean = true) {
        const self = this;
        let _flowAnchor = new FlowAnchor();
        _flowAnchor.data = node;
        let planarExtended = false;
        let _left = 0;
        let _totalPathLength = self.curve.node().getTotalLength();
        let _anchor;
        if (!self.useDataPostions) {
            if (!self.lastAnchorAtLength) {
                self.lastAnchorAtLength = 0;
                self.lastAnchor = { 'x': 0, 'y': 0 };
                self.lastAnchorAtLength = self.lastAnchorAtLength + (self.DEFAULTS.EventBoxWidth / 2);
            } else {
                self.lastAnchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
                self.lastAnchorAtLength = self.lastAnchorAtLength + self.DEFAULTS.DefaultAnchorNodeSpacing;
            }
            _anchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
            let diffToCompare = self.lastAnchorAlignedLeft ? (self.DEFAULTS.EventBoxWidth * 2) + 20 : self.DEFAULTS.EventBoxWidth + 20;
            while ((_anchor['x'] - (self.DEFAULTS.EventBoxWidth / 2) < 0) || (_anchor['x'] - self.lastAnchor['x'] <= diffToCompare)) {
                self.lastAnchorAtLength = self.lastAnchorAtLength + 10;
                if (!planarExtended && (self.lastAnchorAtLength > _totalPathLength)) {
                    self.extendPlanarCurve();
                    planarExtended = true;
                }
                _anchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
            }
        } else {
            if (!self.lastAnchorAtLength) {
                self.lastAnchorAtLength = 0;
            }
            self.lastAnchorAtLength = self.lastAnchorAtLength + node.nodeData.diff;
            _anchor = self.curve.node().getPointAtLength(self.lastAnchorAtLength);
            if (!planarExtended && ((self.lastAnchorAtLength > _totalPathLength) || ((self.lastAnchorAtLength + (self.DEFAULTS.EventBoxWidth / 2) + 50) > _totalPathLength))) {
                self.extendPlanarCurve();
                planarExtended = true;
            }
        }
        if (_anchor) {
            _flowAnchor.anchor = _anchor;
            _flowAnchor.anchorDistance = self.lastAnchorAtLength;
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
            let _anchorNextForSlope = self.curve.node().getPointAtLength(self.lastAnchorAtLength + 1);
            let slope = (_anchorNextForSlope['y'] - _anchor['y']) / (_anchorNextForSlope['x'] - _anchor['x']);
            let top, left;
            let position = '';
            let topOffset = self.DEFAULTS.ShowEventBoxes ? self.DEFAULTS.EventBoxHeight + 25 : self.DEFAULTS.EventBoxHeight + 10;
            let bottomOffset = self.DEFAULTS.ShowEventBoxes ? 25 : 10;
            top = (slope < 0 ? _anchor['y'] - topOffset : _anchor['y'] + bottomOffset);
            position = slope < 0 ? 'top' : 'bottom';
            if ((top + self.DEFAULTS.EventBoxHeight > self.containerHeight) || (top < 0)) {
                top = (slope < 0 ? _anchor['y'] + bottomOffset : _anchor['y'] - topOffset);
                position = slope < 0 ? 'bottom' : 'top';
            }
            // LEFT ADJUSTED BY HALF OF BOX WITH
            left = (_anchor['x'] - (self.DEFAULTS.EventBoxWidth / 2));
            _flowAnchor.eventBoxLeft = left;
            self.lastAnchorAlignedLeft = false;
            _flowAnchor.eventBoxPosition = position;
            _flowAnchor.eventBox = self.container.append('div');
            _flowAnchor.eventBox.attr('tabindex', 0);
            _flowAnchor.eventBox.node().classList.add('flow-box-event-container');
            _flowAnchor.eventBox.attr('id', GUID() + '_EVB');
            _flowAnchor.eventBox.node().style.width = self.DEFAULTS.EventBoxWidth + 'px';
            _flowAnchor.eventBox.node().style.height = self.DEFAULTS.EventBoxHeight + 'px';
            _flowAnchor.eventBox.node().style.top = top + 'px';
            _flowAnchor.eventBox.node().style.left = _flowAnchor.eventBoxLeft + 'px';
            _flowAnchor.upperBox = _flowAnchor.eventBox.append('div');
            _flowAnchor.upperBox.node().innerHTML = node.upper;
            _flowAnchor.lowerBox = _flowAnchor.eventBox.append('div');
            _flowAnchor.lowerBox.node().classList.add('flow-box-event-text');
            _flowAnchor.lowerBox.node().innerHTML = node.lower;
            let _callback = (function () {
                return function (e: MouseEvent) {
                    let _data = {
                        eventBox: _flowAnchor.eventBox,
                        node: (_flowAnchor.data as FlowBoxNode).nodeData
                    }
                    if (self.editingBoxPositionInTouchMode == true) {
                        self.activeFlowAnchor = _flowAnchor;
                        self.highlightNode(_flowAnchor.data.nodeData);
                    } else if (typeof self.selectionCallBack !== 'undefined' && typeof self.selectionCallBack === 'function') {
                        self.selectionCallBack(_data);
                    }
                }
            })();
            _flowAnchor.eventBox.on('click', _callback);
            if (self.DEFAULTS.ShowEventBoxes) {
                let arrowInBox: d3.Selection<any, any, null, undefined> = _flowAnchor.eventBox.append('div');
                _flowAnchor.eventBox.attr('data-color', node.nodeColor);
                _flowAnchor.eventBox.node().style.background = LightenDarkenColor(node.nodeColor, 120);
                _flowAnchor.eventBox.node().style.borderColor = node.nodeColor;
                arrowInBox.node().style.borderTopColor = 'transparent';
                arrowInBox.node().style.borderBottomColor = 'transparent';
                arrowInBox.node().style.borderRightColor = 'transparent';
                arrowInBox.node().classList.add(position + '-side-arrow');
                if (position === 'top')
                    arrowInBox.node().style.borderTopColor = node.nodeColor;
                else if (position === 'bottom')
                    arrowInBox.node().style.borderBottomColor = node.nodeColor;
                else if (position === 'right')
                    arrowInBox.node().style.borderRightColor = node.nodeColor;
                _flowAnchor.arrowInBox = arrowInBox;
                _flowAnchor.lowerBox.node().style.background = node.nodeColor;
                _flowAnchor.lowerBox.node().style.color = '#FFF';
            }
            self.anchors.push(_flowAnchor);
            if (scroll) {
                let _scrollPos = left - 150;
                $(self.container.node()).animate({ scrollLeft: _scrollPos + 'px' }, 300);
            }
            _flowAnchor.eventBox.on('keyup', () => {
                if (self.editingBoxPositionInTouchMode && self.activeFlowAnchor.data.nodeData.id === _flowAnchor.data.nodeData.id) {
                    if ((d3.event as KeyboardEvent).keyCode == 39 || (d3.event as KeyboardEvent).keyCode == 40) {
                        self.moveActiveNode(self.DEFAULTS.EditBaseDistanceChange);
                    } else if ((d3.event as KeyboardEvent).keyCode == 37 || (d3.event as KeyboardEvent).keyCode == 38) {
                        self.moveActiveNode(-self.DEFAULTS.EditBaseDistanceChange);
                    }
                    d3.event.stopPropagation();
                    d3.event.preventDefault();
                    return false;
                }
            })
            _flowAnchor.eventBox.on('keydown', () => {
                let prevent: Boolean = false;
                if (self.editingBoxPositionInTouchMode && self.activeFlowAnchor.data.nodeData.id === _flowAnchor.data.nodeData.id) {
                    if ((d3.event as KeyboardEvent).keyCode == 39) {
                        prevent = true;
                    } else if ((d3.event as KeyboardEvent).keyCode == 37) {
                        prevent = true;
                    }
                }
                if (prevent) {
                    d3.event.stopPropagation();
                    d3.event.preventDefault();
                    return false;
                }
            })
        }
    }
    moveActiveNode(distance: number) {
        const self = this;
        var anchorDistance = self.activeFlowAnchor.anchorDistance + distance;
        var newAnchor = self.curve.node().getPointAtLength(anchorDistance);
        let x = newAnchor.x;
        let y = newAnchor.y;
        self.activeFlowAnchor.innerNode.attr('cx', x);
        self.activeFlowAnchor.outerNode.attr('cx', x);
        self.activeFlowAnchor.innerNode.attr('cy', y);
        self.activeFlowAnchor.outerNode.attr('cy', y);
        self.activeFlowAnchor.anchor = newAnchor;
        self.activeFlowAnchor.anchorDistance = anchorDistance;
        let _anchorNextForSlope = self.curve.node().getPointAtLength(self.lastAnchorAtLength + 1);
        let slope = (_anchorNextForSlope['y'] - newAnchor['y']) / (_anchorNextForSlope['x'] - newAnchor['x']);
        let top, left;
        let position = '';
        let topOffset = self.DEFAULTS.ShowEventBoxes ? self.DEFAULTS.EventBoxHeight + 25 : self.DEFAULTS.EventBoxHeight + 10;
        let bottomOffset = self.DEFAULTS.ShowEventBoxes ? 25 : 10;
        top = (slope < 0 ? newAnchor['y'] - topOffset : newAnchor['y'] + bottomOffset);
        position = slope < 0 ? 'top' : 'bottom';
        if ((top + self.DEFAULTS.EventBoxHeight > self.containerHeight) || (top < 0)) {
            top = (slope < 0 ? newAnchor['y'] + bottomOffset : newAnchor['y'] - topOffset);
            position = slope < 0 ? 'bottom' : 'top';
        }
        // LEFT ADJUSTED BY HALF OF BOX WITH
        left = (newAnchor['x'] - (self.DEFAULTS.EventBoxWidth / 2));
        self.activeFlowAnchor.eventBoxLeft = left;
        self.lastAnchorAlignedLeft = false;
        self.activeFlowAnchor.eventBoxPosition = position;
        self.activeFlowAnchor.eventBox.node().style.top = top + 'px';
        self.activeFlowAnchor.eventBox.node().style.left = self.activeFlowAnchor.eventBoxLeft + 'px';
        self.activeFlowAnchor.arrowInBox.node().classList.add(position + '-side-arrow');
        self.activeFlowAnchor.arrowInBox.node().style.borderTopColor = 'transparent';
        self.activeFlowAnchor.arrowInBox.node().style.borderBottomColor = 'transparent';
        self.activeFlowAnchor.arrowInBox.node().style.borderRightColor = 'transparent';
        if (position === 'top')
            self.activeFlowAnchor.arrowInBox.node().style.borderTopColor = self.activeFlowAnchor.data.nodeData.nodeColor;
        else if (position === 'bottom')
            self.activeFlowAnchor.arrowInBox.node().style.borderBottomColor = self.activeFlowAnchor.data.nodeData.nodeColor;
        else if (position === 'right')
            self.activeFlowAnchor.arrowInBox.node().style.borderRightColor = self.activeFlowAnchor.data.nodeData.nodeColor;
    }
    redraw() {
        const self = this;
        self.lastAnchorAtLength = null;
        let _nodes = self.getNodes();
        self.anchors.forEach((anchor: FlowAnchor) => {
            anchor.innerNode.remove();
            anchor.outerNode.remove();
            anchor.lowerBox.remove();
            anchor.upperBox.remove();
            anchor.eventBox.remove();
        });
        self.anchors = [];

        self.initialize(_nodes);
    }
    reset() {
        const self = this;
        self.lastAnchorAtLength = null;
        self.anchors.forEach((anchor: FlowAnchor) => {
            anchor.innerNode.remove();
            anchor.outerNode.remove();
            anchor.lowerBox.remove();
            anchor.upperBox.remove();
            anchor.eventBox.remove();
        });
        self.anchors = [];
        self.curveAnchors.forEach((anchor: CurveAnchor) => {
            anchor.anchor.remove();
        });
        self.curveAnchors = [];
        self.initialize([]);
    }
    getNodes(): any[] {
        const self = this;
        let lastDiff = 0;
        self.anchors.forEach((anchor: FlowAnchor) => {
            (anchor.data as FlowBoxNode).nodeData.diff = anchor.anchor['x'] - lastDiff;
            lastDiff = anchor.anchor['x'];
        });
        return self.anchors.map((anchor: FlowAnchor) => {
            return (anchor.data as FlowBoxNode).nodeData
        });
    }
    enableTouchEdit() {
        const self = this;
        if (self.editingBoxPositionInTouchMode) {
            self.editingBoxPositionInTouchMode = false;
        } else {
            self.editingBoxPositionInTouchMode = true;
            self.removeHighlight();
        }
    }
    highlightNode(node: any) {
        const self = this;
        self.anchors.forEach((anchor: FlowAnchor) => {
            if (anchor.data.nodeData.id === node.id) {
                anchor.eventBox.node().style.outline = '2px dotted #000';
                anchor.eventBox.node().style.outlineOffset = '5px';
            } else {
                anchor.eventBox.node().style.outline = 'none';
            }
        });
    }
    removeHighlight(node?: any) {
        const self = this;
        self.anchors.forEach((anchor: FlowAnchor) => {
            if (node) {
                if (anchor.data.nodeData.id === node.id) {
                    anchor.eventBox.node().style.outline = 'none';
                }
            } else {
                anchor.eventBox.node().style.outline = 'none';
            }
        });
    }
    focusNode(node: any) {
        const self = this;
        self.anchors.forEach((anchor: FlowAnchor) => {
            if (anchor.data.nodeData.id === node.id) {
                let _scrollPos = anchor.eventBoxLeft - 150;
                $(self.container.node()).animate({ scrollLeft: _scrollPos + 'px' }, 300);
            }
        });
    }
    changeData(node: any) {
        const self = this;
        self.anchors.forEach((anchor: FlowAnchor) => {
            if (anchor.data.nodeData.id === node.id) {
                anchor.data.nodeData = node;
                anchor.data.nodeColor = node.nodeColor;
                anchor.data.lower = node.lower;
                anchor.data.upper = node.upper;
                anchor.lowerBox.node().innerHTML = node.lower;
                anchor.upperBox.node().innerHTML = node.upper;
                self.changeColors(anchor);
            }
        });
    }
    changeColors(anchor: FlowAnchor) {
        anchor.innerNode.attr('fill', anchor.data.nodeColor);
        anchor.outerNode.attr('stroke', anchor.data.nodeColor);
        anchor.eventBox.attr('data-color', anchor.data.nodeColor);
        anchor.eventBox.node().style.background = LightenDarkenColor(anchor.data.nodeColor, 120);
        anchor.eventBox.node().style.borderColor = anchor.data.nodeColor;
        if (anchor.eventBoxPosition === 'top')
            anchor.arrowInBox.node().style.borderTopColor = anchor.data.nodeColor;
        else if (anchor.eventBoxPosition === 'bottom')
            anchor.arrowInBox.node().style.borderBottomColor = anchor.data.nodeColor;
        else if (anchor.eventBoxPosition === 'right')
            anchor.arrowInBox.node().style.borderRightColor = anchor.data.nodeColor;
        anchor.lowerBox.node().style.background = anchor.data.nodeColor;
    }
    swapNodes(firsNode: any, secondNode: any) {
        const self = this;
        let tnode = null;
        let snode = null;
        self.anchors.forEach((anchor: FlowAnchor) => {
            if (anchor.data.nodeData.id === firsNode.id) {
                var node: any = Object.assign({}, anchor.data.nodeData);
                node.lower = secondNode.lower;
                node.upper = secondNode.upper;
                node.nodeColor = secondNode.nodeColor;
                tnode = node;
            }
            else if (anchor.data.nodeData.id === secondNode.id) {
                var node: any = Object.assign({}, anchor.data.nodeData);
                node.lower = firsNode.lower;
                node.upper = firsNode.upper;
                node.nodeColor = firsNode.nodeColor;
                snode = node;
            }
        });
        if (tnode) self.changeData(tnode);
        if (snode) self.changeData(snode);
    };
    deleteNode(node: any) {
        const self = this;
        let targetAnchor: FlowAnchor = null;
        let targetIndex: number = null;
        let restNodes: any[] = [];
        self.anchors.forEach((anchor: FlowAnchor, index: number) => {
            if (anchor.data.nodeData.id === node.id) {
                targetIndex = index;
            }
        });
        if (targetIndex >= 0) {
            targetAnchor = self.anchors[targetIndex - 1];
            self.anchors.forEach((anchor: FlowAnchor, index: number) => {
                if (index >= targetIndex) {
                    anchor.innerNode.remove();
                    anchor.outerNode.remove();
                    anchor.lowerBox.remove();
                    anchor.upperBox.remove();
                    anchor.eventBox.remove();
                    anchor.arrowInBox.remove();
                }
                if (index > targetIndex) {
                    restNodes.push(anchor.data);
                }
            });
            self.anchors = self.anchors.filter((anchor: FlowAnchor, index: number) => {
                return index < targetIndex;
            });
            self.lastAnchorAtLength = targetAnchor ? targetAnchor.anchorDistance : 0; 
            restNodes.forEach((nd: any) => {
                self.addAnchor(nd, false);
            });
        }
    }
}

function LightenDarkenColor(col: any, amt: any) {
    var usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
    var num = parseInt(col, 16);
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    var g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}


function hexToRgb(hex: string) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function GUID(): string {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + '-' + s4();
}