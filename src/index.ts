// Import dependencies
import EasyLogReport from 'easy-log-report'
import {InitTrackOptions} from "./interface";
import getLastEvent from "./utils/getLastEvent";
import getSelector from "./utils/getSelector";
import onload from "./utils/onload";
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

// Define the EasyTrack class
class EasyTrack {
    private easyLogReport: EasyLogReport
    private initConfig: InitTrackOptions

    // Constructor that initializes the EasyLogReport and configuration options
    constructor(props?: InitTrackOptions) {
        this.easyLogReport = new EasyLogReport(props)
        this.initConfig = {
            track: ['jsError', 'performance', 'xhr'],
            ...(props || {})
        }
    }

    // Method that initializes the tracking, injects error handling and performance tracking, and runs a callback if provided
    init(cb?: () => void) {
        // Prevent multiple initialization
        if((window as any).easyTrack) {
            console.error('EasyTrack - init function has call twice')
            return
        }
        // Set the EasyTrack instance as a global variable
        (window as any).easyTrack = this
        // Initialize the EasyLogReport instance
        this.easyLogReport.init()
        // Inject error handling for JavaScript errors and Promise rejections if 'jsError' is in the tracked items
        if(this.initConfig.track?.includes('jsError')) {
            this.injectJsError()
        }
        // Track web performance metrics if 'performance' is in the tracked items
        if(this.initConfig.track?.includes('performance')) {
            this.performance()
        }
        // Inject error handling for XHR requests if 'xhr' is in the tracked items
        if(this.initConfig.track?.includes('xhr')) {
            this.injectXHR()
        }
        // Run the callback function if provided
        cb && cb()
    }

    // Method that injects error handling for JavaScript errors and Promise rejections
    injectJsError() {
        const logReport = this.easyLogReport
        // Listen for global uncaught errors
        window.addEventListener('error', function (event) {
            let lastEvent = getLastEvent();
            // This is a script/resource loading error
            if (event.target && ((event.target as any)?.src || (event.target as any)?.href)) {
                logReport.error({
                    eventType: 'onError',
                    elemId: (event.target as any)?.tagName,
                    extraParams: {
                        type: 'stability',
                        errorType: 'resourceError',
                        filename: (event.target as any)?.src || (event.target as any)?.href,
                        tagName: (event.target as any)?.tagName,
                        selector: getSelector(event.target as Node)
                    }
                });
            } else {
                // This is a JavaScript execution error
                logReport.error({
                    eventType: 'onError',
                    elemId: (event.target as any)?.tagName,
                    extraParams: {
                        type: 'stability',
                        errorType: 'jsError',
                        message: event.message,
                        filename: event.filename,
                        position: `${event.lineno}:${event.colno}`,
                        stack: event.error.stack,
                        selector: lastEvent ? getSelector(lastEvent?.target as Node) : ''
                    }
                });
            }
        }, true);
        // Listen for unhandled Promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            let lastEvent = getLastEvent();
            let message;
            let filename;
            let line = 0;
            let column = 0;
            let stack = '';
            let reason = event.reason;
            if (typeof reason === 'string') {
                message = reason;
            } else if (typeof reason === 'object') {
                message = reason.message;
                if (reason.stack) {
                    let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
                    filename = matchResult[1];
                    line = matchResult[2];
                    column = matchResult[3];
                }
                stack = reason.stack;
            }
            logReport.error({
                eventType: 'onError',
                elemId: (event.target as any)?.tagName,
                extraParams: {
                    stack,
                    message,
                    filename,
                    type: 'stability',
                    errorType: 'promiseError',
                    position: `${line}:${column}`,
                    selector: lastEvent ? getSelector(lastEvent?.target as Node) : ''
                }
            });
        }, true);
    }

    // Method that tracks web performance metrics using web-vitals library and PerformanceObserver API
    performance() {
        const logReport = this.easyLogReport

        // Callback to log web performance metrics
        const logPerformance = (metric: any) => {
            logReport.log({
                eventType: 'onShow',
                extraParams: {
                    type: 'experience',
                    ...metric
                }
            });
        }
        // Track web performance metrics using web-vitals library
        getCLS(logPerformance)
        getFID(logPerformance)
        getFCP(logPerformance)
        getLCP(logPerformance)
        getTTFB(logPerformance)

        // Use PerformanceObserver API to track long tasks
        if(PerformanceObserver) {
            new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.duration > 100) {
                        let lastEvent = getLastEvent();
                        requestIdleCallback(() => {
                            logReport.warn({
                                eventType:'onShow',
                                extraParams: {
                                    type: "experience",
                                    name: "longTask",
                                    eventType: lastEvent.type,
                                    startTime: entry.startTime,
                                    duration: entry.duration,
                                    selector: lastEvent
                                        ? getSelector((lastEvent as any).path || lastEvent.target)
                                        : '',
                                }
                            });
                        });
                    }
                });
            }).observe({ entryTypes: ["longtask"] });
        }
    }

    // Method that injects error handling for XHR requests
    injectXHR() {
        const logReport = this.easyLogReport
        const initConfig = this.initConfig
        let XMLHttpRequest = window.XMLHttpRequest;
        let oldOpen = XMLHttpRequest.prototype.open;
        let logData: any = {}

        // Override the XMLHttpRequest's open method to track request details
        // @ts-ignore
        XMLHttpRequest.prototype.open = function (method, url, async) {
            const re = new RegExp(initConfig.sendUrl || '', 'g')
            if (!initConfig.sendUrl || !(url as string).match(re)) {
                logData = { method, url, async };
            }
            // Call the original open method
            // @ts-ignore
            return oldOpen.apply(this, arguments);
        }

        let oldSend = XMLHttpRequest.prototype.send;
        // Override the XMLHttpRequest's send method to track request performance and errors
        XMLHttpRequest.prototype.send = function (body) {
            if (logData) {
                let startTime = Date.now();
                // Define a handler function to log request performance and errors
                let handler = (type: string) => (_: any) => {
                    let duration = Date.now() - startTime;
                    let status = this.status;
                    let statusText = this.statusText;

                    logReport.error({
                        eventType: 'request',
                        extraParams: {
                            duration,
                            type: 'stability',
                            errorType: 'xhr',
                            eventType: type,
                            pathname: logData?.url,
                            status: status + '-' + statusText,
                            response: this.response ? JSON.stringify(this.response) : '',
                            params: body || ''
                        }
                    });
                }
                // Add event listeners to the XHR object to handle different types of events
                this.addEventListener('load', handler('load'), false);
                this.addEventListener('error', handler('error'), false);
                this.addEventListener('abort', handler('abort'), false);
            }
            // Call the original open method
            // @ts-ignore
            return oldSend.apply(this, arguments);
        }
    }
}

// Export the EasyTrack class as the default export
export default EasyTrack