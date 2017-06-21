/// <reference path="flowbox.ts" />
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
