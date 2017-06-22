let colors = ['#0073C6', '#2ecc71', '#3498db', '#9b59b6', '#f39c12', '#d35400', '#e74c3c', '#34495e'];

angular.module('SampleApp', [])
    .controller('SampleAppController', ['$timeout',function ($timeout) {
        console.log('SampleApp init');
        const self = this;
        self.containerId = 'container1';
        let flowbox = {};
        self.addNode = function () {
            let node = new FlowBoxNode(
                '<p>Lorem ipsum dolor sit amet, consectetur </p>',
                '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
                colors[Math.floor(Math.random() * colors.length)]
            );
            flowbox.addAnchor(node);
        }
        self.reset = function() {
            flowbox.reset();
        }
        self.download = function() {
            console.log(flowbox.getNodes());
        }
        self.init = function() {            
            let _containerElm = document.getElementById(self.containerId);
            let defs = Object.create(FLOW_DEFAULTS);
            defs.DefaultContainerHeightFraction = 1;
            defs.DefaultCurveColor = '#aae4ff';
            defs.ShowEventBoxes = true;
            flowbox = new FlowBox(defs, self.containerId, getNodes());
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
        },
        {
            lower: '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper: '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        }
    ];
}