const urlParams = new URLSearchParams(window.location.search);
const modelParam = urlParams.get('model');

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
        document.exitFullscreen();
    }
}
