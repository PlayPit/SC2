$(document).ready(function(){
    windowResize();
    $('#sc-extension').resize(function() {
        windowResize();
    });
});

function windowResize() {
    var w = $(window), d = $('#sc-extension');
    var resizedW = (d.width() - w.width());
    var resizedH = (d.height() - w.height());
    manualResizing = false;
    window.resizeBy(resizedW, resizedH);
}