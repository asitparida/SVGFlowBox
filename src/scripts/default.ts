/// <reference path="flowbox.ts" />

let colors = ['#0073C6', '#2ecc71', '#3498db', '#9b59b6', '#f39c12', '#d35400', '#e74c3c', '#34495e'];

document.addEventListener('DOMContentLoaded', () => {
    let _containerElm = document.getElementById('container');
    _containerElm.style.display = 'BLOCK';
    _containerElm.style.overflowY = 'hidden';
    _containerElm.style.height = '80vh';
    _containerElm.style.width = '80%';
    let _containerId = 'container';
    let defs = Object.create(FLOW_DEFAULTS);
    defs.DefaultContainerHeightFraction = 1;
    defs.DefaultCurveColor = '#aae4ff';
    defs.ShowEventBoxes = true;
    let _box = new FlowBox(defs , _containerId, getNodes());
    let _btn = document.getElementById('addBtn');
    if (_btn) {
        _btn.addEventListener('click', function () {
            let node: FlowBoxNode = new FlowBoxNode(
                '<p>Lorem ipsum dolor sit amet, consectetur </p>',
                '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
                colors[Math.floor(Math.random() * colors.length)]
            );
            _box.addAnchor(node);
        })
    }
});

function getNodes(): any[]{
    return [
        {
            lower : '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper : '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower : '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper : '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower : '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper : '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower : '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper : '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower : '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper : '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower : '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper : '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        },
        {
            lower : '<p>Lorem ipsum dolor sit amet, consectetur </p>',
            upper : '<img class="flow-box-event-img" src="icons-roller-coaster.png" />',
            nodeColor: colors[Math.floor(Math.random() * colors.length)]
        }
    ];
}