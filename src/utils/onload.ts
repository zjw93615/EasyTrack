// This function takes a callback function as an argument and runs it when the document is fully loaded
export default function (callback: () => void) {
    if (document.readyState === 'complete') {
        // If the document is already loaded, run the callback immediately
        callback();
    } else {
        // Otherwise, add an event listener to run the callback when the window is fully loaded
        window.addEventListener('load', callback);
    }
}