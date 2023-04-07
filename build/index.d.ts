import { InitTrackOptions } from "./interface";
declare class EasyTrack {
    private easyLogReport;
    private initConfig;
    constructor(props?: InitTrackOptions);
    init(cb?: () => void): void;
    injectJsError(): void;
    performance(): void;
    injectXHR(): void;
}
export default EasyTrack;
