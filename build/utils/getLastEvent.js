// Define a variable to hold the last event
var lastEvent;
// Add event listeners for multiple event types
['click', 'touchstart', 'mousedown', 'keydown', 'mouseover'].forEach(function (eventType) {
    // Add an event listener for each event type
    document.addEventListener(eventType, function (event) {
        // When an event is triggered, assign it to the lastEvent variable
        lastEvent = event;
    }, {
        // Use capture phase to trigger event listeners on the way down to the target element
        capture: true,
        // Use passive mode to prevent blocking of default browser behaviors
        passive: true
    });
});
// Export a function that returns the lastEvent variable
export default function () {
    return lastEvent;
}
