/// <reference path="flowbox.ts" />
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
