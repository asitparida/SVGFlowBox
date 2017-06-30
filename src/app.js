let colors = ['#0073C6', '#2ecc71', '#3498db', '#9b59b6', '#f39c12', '#d35400', '#e74c3c', '#34495e'];

angular.module('SampleApp', [])
    .controller('SampleAppController', ['$timeout',function ($timeout) {
        const self = this;
        self.containerId = 'container1';
        let flowbox = {};
        self.addNode = function () {
            let node = new FlowBoxNode({
                lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
                upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
                nodeColor: colors[Math.floor(Math.random() * colors.length)]
            });
            flowbox.addAnchor(node);
        }
        self.reset = function() {
            flowbox.reset();
        }
        self.redraw = function() {
            flowbox.redraw();
        }
        self.touchEdit = function() {
            flowbox.enableTouchEdit();
        }
        self.download = function() {
            console.log(flowbox.getNodes());
        }
        self.downloadBaseAnchors = function(){
            console.log(flowbox.getBaseAnchors());
        }
        self.consoleLog = function(data) {
            console.log(data);
        }
        self.init = function() {            
            let _containerElm = document.getElementById(self.containerId);
            let defs = Object.create(FLOW_DEFAULTS);
            defs.DefaultContainerHeightFraction = 1;
            defs.DefaultCurveColor = '#aae4ff';
            defs.ShowEventBoxes = true;
            defs.EventBoxWidth = 200;

            let height =  document.getElementById(self.containerId).getBoundingClientRect().height;
            let heightDiffer = height / 5;
            defs.BaseAnchors = [];
            defs.BaseAnchors.push([0, 0]);
            defs.BaseAnchors.push([100, - heightDiffer * 2]);
            defs.BaseAnchors.push([300, - heightDiffer * 2.25]);
            defs.BaseAnchors.push([50, heightDiffer * 1]);
            defs.BaseAnchors.push([200, heightDiffer * 1.70]);
            defs.BaseAnchors.push([200, - heightDiffer * 1.5]);
            defs.BaseAnchors.push([200, - heightDiffer * 1.70]);
            defs.BaseAnchors.push([50, heightDiffer * 1]);
            defs.BaseAnchors.push([150, heightDiffer * 1.50]);
            defs.BaseAnchors.push([200, 0]);
            
            flowbox = new FlowBox(defs, self.containerId, getNodes(), self.consoleLog);
        }
        $timeout(function() {
            self.init();
        }, 100);        
    }])

function getNodes() {
    return [
        {
            lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)],
            id: 1
        }
        ,
        {
            lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        }
    ];
}