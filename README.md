# EasyTrack

[comment]: <> ([![npm]&#40;https://img.shields.io/npm/v/easy-log-report.svg&#41;]&#40;https://www.npmjs.com/package/easy-log-report&#41;)

[comment]: <> ([![CI]&#40;https://github.com/zjw93615/EasyLog/actions/workflows/npmjs.yml/badge.svg?event=release&#41;]&#40;https://github.com/zjw93615/EasyLog/actions/workflows/npmjs.yml&#41;)

[comment]: <> ([![Coverage Status]&#40;https://coveralls.io/repos/github/zjw93615/EasyLog/badge.svg?branch=master&#41;]&#40;https://coveralls.io/github/zjw93615/EasyLog?branch=master&#41;)


EasyTrack is a Typescript library for dealing with js error, xhr error and performance tracking.

## Installation

```sh
yarn add easy-track
```
or
```sh
npm install easy-track
```

## Usage
### Config and Init
Create your 
Report log by sendBeacon function
```javascript
import EasyTrack from 'easy-track'

const easyTrack = new EasyTrack({
    acceptEventType: ['onLaunch', 'onLoad', 'onUnload', 'onShow', 'request', 'onError', 'click'],
    track: ['jsError', 'performance', 'xhr'],
    sendInterval: 1000 * 30,
    sendQueueSize: 30,
    sendUrl: 'http://localhost:8080/api/log/beacon/',
    sendType: SEND_TYPE.BEACON,
    singleMode: false,
    getCurrentPage: () => window.location.href,
    getInitialEventContent: () => {
        return {
            appInfo: {
                // appID,
                // version,
                // appName,
            },
            systemInfo: {
                ua: navigator.userAgent,
                is_cookie: window.navigator.cookieEnabled ? 1 : 0,
                cookie: document.cookie || '',
                screen_height: window.screen.availHeight,
                screen_width: window.screen.availWidth,
            },
            userInfo: {
                // userId,
                // openId,
            },
        }
    },
})
easyTrack.init()

export default easyTrack
```
OR report log by your custom sendFn
```javascript
import EasyTrack from 'easy-track'

const easyTrack = new EasyTrack({
    acceptEventType: ['onLaunch', 'onLoad', 'onUnload', 'onShow', 'request', 'onError', 'click'],
    track: ['jsError', 'performance', 'xhr'],
    sendInterval: 1000 * 30,
    sendQueueSize: 30,
    sendFn: e => {
        doReportSend(e)
        console.log('EasyLogReport', e)
    },
    singleMode: false,
    getCurrentPage: () => window.location.href,
    getInitialEventContent: () => {
        return {
            appInfo: {
                // appID,
                // version,
                // appName,
            },
            systemInfo: {
                ua: navigator.userAgent,
                is_cookie: window.navigator.cookieEnabled ? 1 : 0,
                cookie: document.cookie || '',
                screen_height: window.screen.availHeight,
                screen_width: window.screen.availWidth,
            },
            userInfo: {
                // userId,
                // openId,
            },
        }
    },
})

easyTrack.init(() => {
    console.log('EasyLogReport init!')
})

export default easyTrack
```


## Config Props
|  Property   | Description  | Type | Default |
|  ----  | ----  | ---- | ---- |
| acceptEventType  | log event types that are allowed to be reported | string[] | ['onLaunch', 'onLoad', 'onUnload', 'onShow', 'request', 'onError', 'click'] |
| track  | event types that need to be tracked | string[] | ['jsError', 'performance', 'xhr'] |
| sendInterval  | send function trigger interval(millisecond) | number | 1000 * 30 |
| sendQueueSize  | the maximum number of logs in queue | number | 50 |
| singleMode | If it`s singleMode, report log immediately | boolean | false |
| sendUrl  | report url | number | - |
| sendType  | reporting mode | SEND_TYPE.IMG / SEND_TYPE.BEACON | - |
| sendFn  | custom sendFn, If sendFn is set, sendUrl and sendType would be remove | (content: ReportContent) => void | - |
| getCurrentPage  | get current page route | () => string | - |
| getInitialEventContent  | get the default log content | () => InitialReportContent | - |


## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)