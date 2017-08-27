let colors = ['#0073C6', '#2ecc71', '#3498db', '#9b59b6', '#f39c12', '#d35400', '#e74c3c', '#34495e'];
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-bottom-center",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}
angular.module('SampleApp', [])
    .controller('SampleAppController', ['$timeout', '$scope', function ($timeout, $scope) {
        const self = this;
        self.containerId = 'container1';
        let flowbox = {};
        self.touchOnNavActive = false;
        self.currentNode = null;
        self.addNode = function () {
            let node = new FlowBoxNode({
                lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
                upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
                nodeColor: colors[Math.floor(Math.random() * colors.length)],
                diff: 240
            });
            flowbox.addAnchor(node);
        }
        self.reset = function () {
            flowbox.reset();
        }
        self.redraw = function () {
            flowbox.redraw();
        }
        self.touchEdit = function () {
            flowbox.enableTouchEdit();
            self.touchOnNavActive = !self.touchOnNavActive; 
        }
        self.download = function () {
            console.log(flowbox.getNodes());
        }
        self.downloadBaseAnchors = function () {
            console.log(flowbox.getBaseAnchors());
        }
        self.consoleLog = function (data) {
            console.log(data);
            $scope.$apply(() => {
                if (!self.currentNode) {
                    self.currentNode = data.node;
                    flowbox.highlightNode(data.node);
                } else {
                    flowbox.removeHighlight();
                    self.currentNode = null;
                }
            });
        }
        self.deleteNode = function () {
            if (self.currentNode) {
                flowbox.deleteNode(self.currentNode);
                self.currentNode = null;
            }
        }
        self.focusRandomNode = function () {
            var nodes = flowbox.getNodes();
            var randomNode = Math.floor(Math.random() * nodes.length);
            flowbox.highlightNode(nodes[randomNode]);
            flowbox.focusNode(nodes[randomNode]);
        }
        self.changeRandomNodeData = function () {
            var nodes = flowbox.getNodes();
            var randomNode = nodes[Math.floor(Math.random() * nodes.length)];
            randomNode.lower = '<p>Excepteur sint occaecat cupidatat non proident</p>';
            randomNode.nodeColor = colors[Math.floor(Math.random() * colors.length)];
            flowbox.highlightNode(randomNode);
            flowbox.focusNode(randomNode);
            setTimeout(() => {
                flowbox.changeData(randomNode);
                setTimeout(() => {
                    flowbox.removeHighlight(randomNode);
                }, 2000);
            }, 1000);
        }
        self.swapRandomNodes = function () {
            var nodes = flowbox.getNodes();
            var randomFirstNodeIndex = Math.floor(Math.random() * nodes.length);
            var randomSecondNodeIndex = Math.floor(Math.random() * nodes.length);
            if (randomFirstNodeIndex !== randomSecondNodeIndex) {
                var firstNode = nodes[randomFirstNodeIndex];
                var secondNode = nodes[randomSecondNodeIndex];
                toastr.clear();
                toastr.info('Swapping nodes ' + (randomFirstNodeIndex + 1) + ' with ' + (randomSecondNodeIndex + 1));
                flowbox.highlightNode(firstNode);
                flowbox.focusNode(firstNode);
                setTimeout(() => {
                    flowbox.highlightNode(secondNode);
                    flowbox.focusNode(secondNode);
                    setTimeout(() => {
                        flowbox.swapNodes(firstNode, secondNode);
                        setTimeout(() => {
                            flowbox.highlightNode(firstNode);
                            flowbox.focusNode(firstNode);
                        }, 1000);
                    }, 2000);
                }, 2000);
            }
        }
        self.init = function () {
            let _containerElm = document.getElementById(self.containerId);
            let defs = Object.create(FLOW_DEFAULTS);
            defs.DefaultContainerHeightFraction = 1;
            defs.DefaultCurveColor = '#aae4ff';
            defs.ShowCurveAnchors = false;
            defs.ShowEventBoxes = true;
            defs.EventBoxWidth = 200;

            let height = document.getElementById(self.containerId).getBoundingClientRect().height;
            let heightDiffer = height / 2.5;
            defs.BaseAnchors = [];
            
            defs.BaseAnchors.push([0, 0]);
            defs.BaseAnchors.push([100, - heightDiffer]);
            defs.BaseAnchors.push([200, - heightDiffer]);
            defs.BaseAnchors.push([100, 0]);
            defs.BaseAnchors.push([100, + heightDiffer]);
            defs.BaseAnchors.push([200, + heightDiffer]);
            defs.BaseAnchors.push([100, 0]);
            defs.BaseAnchors.push([100, - heightDiffer]);
            defs.BaseAnchors.push([200, - heightDiffer]);
            defs.BaseAnchors.push([100, 0]);
            defs.BaseAnchors.push([100, + heightDiffer]);
            defs.BaseAnchors.push([200, + heightDiffer]);
            defs.BaseAnchors.push([100, 0]);
            defs.BaseAnchors.push([100, - heightDiffer]);
            defs.BaseAnchors.push([200, - heightDiffer]);
            defs.BaseAnchors.push([100, 0]);
            defs.BaseAnchors.push([100, + heightDiffer]);
            defs.BaseAnchors.push([200, + heightDiffer]);
            defs.BaseAnchors.push([100, 0]);

            flowbox = new FlowBox(defs, self.containerId, getNodes(), self.consoleLog);
        }
        $timeout(function () {
            self.init();
        }, 100);
    }])

function getNodes() {
    return [
        {
            lower: '<p>1Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)],
            diff: 350
        }
        ,
        {
            lower: '<p>2Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)],
            diff: 240
        },
        {
            lower: '<p>3Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)],
            diff: 240
        },
        {
            lower: '<p>4Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)],
            diff: 280
        },
        {
            lower: '<p>5Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)],
            diff: 240
        },
        {
            lower: '<p>6Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)],
            diff: 280
        },
        {
            lower: '<p>7Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)],
            diff: 240
        },
        {
            lower: '<p>8Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)],
            diff: 240
        }
    ];
}