var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
// Import dependencies
import EasyLogReport from 'easy-log-report';
import getLastEvent from "./utils/getLastEvent";
import getSelector from "./utils/getSelector";
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
// Define the EasyTrack class
var EasyTrack = /** @class */ (function () {
    // Constructor that initializes the EasyLogReport and configuration options
    function EasyTrack(props) {
        this.easyLogReport = new EasyLogReport(props);
        this.initConfig = __assign({ track: ['jsError', 'performance', 'xhr'] }, (props || {}));
    }
    // Method that initializes the tracking, injects error handling and performance tracking, and runs a callback if provided
    EasyTrack.prototype.init = function (cb) {
        var _a, _b, _c;
        // Prevent multiple initialization
        if (window.easyTrack) {
            console.error('EasyTrack - init function has call twice');
            return;
        }
        // Set the EasyTrack instance as a global variable
        window.easyTrack = this;
        // Initialize the EasyLogReport instance
        this.easyLogReport.init();
        // Inject error handling for JavaScript errors and Promise rejections if 'jsError' is in the tracked items
        if ((_a = this.initConfig.track) === null || _a === void 0 ? void 0 : _a.includes('jsError')) {
            this.injectJsError();
        }
        // Track web performance metrics if 'performance' is in the tracked items
        if ((_b = this.initConfig.track) === null || _b === void 0 ? void 0 : _b.includes('performance')) {
            this.performance();
        }
        // Inject error handling for XHR requests if 'xhr' is in the tracked items
        if ((_c = this.initConfig.track) === null || _c === void 0 ? void 0 : _c.includes('xhr')) {
            this.injectXHR();
        }
        // Run the callback function if provided
        cb && cb();
    };
    // Method that injects error handling for JavaScript errors and Promise rejections
    EasyTrack.prototype.injectJsError = function () {
        var logReport = this.easyLogReport;
        // Listen for global uncaught errors
        window.addEventListener('error', function (event) {
            var _a, _b, _c, _d, _e, _f, _g;
            var lastEvent = getLastEvent();
            // This is a script/resource loading error
            if (event.target && (((_a = event.target) === null || _a === void 0 ? void 0 : _a.src) || ((_b = event.target) === null || _b === void 0 ? void 0 : _b.href))) {
                logReport.error({
                    eventType: 'onError',
                    elemId: (_c = event.target) === null || _c === void 0 ? void 0 : _c.tagName,
                    extraParams: {
                        type: 'stability',
                        errorType: 'resourceError',
                        filename: ((_d = event.target) === null || _d === void 0 ? void 0 : _d.src) || ((_e = event.target) === null || _e === void 0 ? void 0 : _e.href),
                        tagName: (_f = event.target) === null || _f === void 0 ? void 0 : _f.tagName,
                        selector: getSelector(event.target)
                    }
                });
            }
            else {
                // This is a JavaScript execution error
                logReport.error({
                    eventType: 'onError',
                    elemId: (_g = event.target) === null || _g === void 0 ? void 0 : _g.tagName,
                    extraParams: {
                        type: 'stability',
                        errorType: 'jsError',
                        message: event.message,
                        filename: event.filename,
                        position: "".concat(event.lineno, ":").concat(event.colno),
                        stack: event.error.stack,
                        selector: lastEvent ? getSelector(lastEvent === null || lastEvent === void 0 ? void 0 : lastEvent.target) : ''
                    }
                });
            }
        }, true);
        // Listen for unhandled Promise rejections
        window.addEventListener('unhandledrejection', function (event) {
            var _a;
            var lastEvent = getLastEvent();
            var message;
            var filename;
            var line = 0;
            var column = 0;
            var stack = '';
            var reason = event.reason;
            if (typeof reason === 'string') {
                message = reason;
            }
            else if (typeof reason === 'object') {
                message = reason.message;
                if (reason.stack) {
                    var matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
                    filename = matchResult[1];
                    line = matchResult[2];
                    column = matchResult[3];
                }
                stack = reason.stack;
            }
            logReport.error({
                eventType: 'onError',
                elemId: (_a = event.target) === null || _a === void 0 ? void 0 : _a.tagName,
                extraParams: {
                    stack: stack,
                    message: message,
                    filename: filename,
                    type: 'stability',
                    errorType: 'promiseError',
                    position: "".concat(line, ":").concat(column),
                    selector: lastEvent ? getSelector(lastEvent === null || lastEvent === void 0 ? void 0 : lastEvent.target) : ''
                }
            });
        }, true);
    };
    // Method that tracks web performance metrics using web-vitals library and PerformanceObserver API
    EasyTrack.prototype.performance = function () {
        var logReport = this.easyLogReport;
        // Callback to log web performance metrics
        var logPerformance = function (metric) {
            logReport.log({
                eventType: 'onShow',
                extraParams: __assign({ type: 'experience' }, metric)
            });
        };
        // Track web performance metrics using web-vitals library
        getCLS(logPerformance);
        getFID(logPerformance);
        getFCP(logPerformance);
        getLCP(logPerformance);
        getTTFB(logPerformance);
        // Use PerformanceObserver API to track long tasks
        if (PerformanceObserver) {
            new PerformanceObserver(function (list) {
                list.getEntries().forEach(function (entry) {
                    if (entry.duration > 100) {
                        var lastEvent_1 = getLastEvent();
                        requestIdleCallback(function () {
                            logReport.warn({
                                eventType: 'onShow',
                                extraParams: {
                                    type: "experience",
                                    name: "longTask",
                                    eventType: lastEvent_1.type,
                                    startTime: entry.startTime,
                                    duration: entry.duration,
                                    selector: lastEvent_1
                                        ? getSelector(lastEvent_1.path || lastEvent_1.target)
                                        : '',
                                }
                            });
                        });
                    }
                });
            }).observe({ entryTypes: ["longtask"] });
        }
    };
    // Method that injects error handling for XHR requests
    EasyTrack.prototype.injectXHR = function () {
        var logReport = this.easyLogReport;
        var initConfig = this.initConfig;
        var XMLHttpRequest = window.XMLHttpRequest;
        var oldOpen = XMLHttpRequest.prototype.open;
        var logData = {};
        // Override the XMLHttpRequest's open method to track request details
        // @ts-ignore
        XMLHttpRequest.prototype.open = function (method, url, async) {
            var re = new RegExp(initConfig.sendUrl || '', 'g');
            if (!initConfig.sendUrl || !url.match(re)) {
                logData = { method: method, url: url, async: async };
            }
            // Call the original open method
            // @ts-ignore
            return oldOpen.apply(this, arguments);
        };
        var oldSend = XMLHttpRequest.prototype.send;
        // Override the XMLHttpRequest's send method to track request performance and errors
        XMLHttpRequest.prototype.send = function (body) {
            var _this = this;
            if (logData) {
                var startTime_1 = Date.now();
                // Define a handler function to log request performance and errors
                var handler = function (type) { return function (_) {
                    var duration = Date.now() - startTime_1;
                    var status = _this.status;
                    var statusText = _this.statusText;
                    logReport.error({
                        eventType: 'request',
                        extraParams: {
                            duration: duration,
                            type: 'stability',
                            errorType: 'xhr',
                            eventType: type,
                            pathname: logData === null || logData === void 0 ? void 0 : logData.url,
                            status: status + '-' + statusText,
                            response: _this.response ? JSON.stringify(_this.response) : '',
                            params: body || ''
                        }
                    });
                }; };
                // Add event listeners to the XHR object to handle different types of events
                this.addEventListener('load', handler('load'), false);
                this.addEventListener('error', handler('error'), false);
                this.addEventListener('abort', handler('abort'), false);
            }
            // Call the original open method
            // @ts-ignore
            return oldSend.apply(this, arguments);
        };
    };
    return EasyTrack;
}());
// Export the EasyTrack class as the default export
export default EasyTrack;
