// This function takes a path of nodes or a single node and returns a CSS selector based on the node(s)
function getSelectors(path) {
    // Reverse the path to start from the target element
    return path.reverse().filter(function (element) {
        // Filter out the document and window elements
        return element !== document && element !== window;
    }).map(function (element) {
        var selector = element.nodeName.toLowerCase();
        if (element.id) {
            // If the element has an ID, use it in the selector
            selector += "#".concat(element.id);
        }
        if (element.className && typeof element.className === 'string') {
            // If the element has a class name, use it in the selector
            selector += ".".concat(element.className);
        }
        return selector;
    }).join(' ');
}
// This function takes a path or a target node and returns a CSS selector
export default function (pathsOrTarget) {
    if (Array.isArray(pathsOrTarget)) {
        // If the argument is an array, assume it's a path of nodes
        return getSelectors(pathsOrTarget);
    }
    else {
        // Otherwise, assume it's a single node and generate a path from it
        var path = [];
        while (pathsOrTarget) {
            path.push(pathsOrTarget);
            pathsOrTarget = pathsOrTarget === null || pathsOrTarget === void 0 ? void 0 : pathsOrTarget.parentNode;
        }
        return getSelectors(path);
    }
}
