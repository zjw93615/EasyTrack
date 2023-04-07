import { ReportOptions } from "easy-log-report/build/interface";
export interface InitTrackOptions extends ReportOptions {
    track: ('jsError' | 'performance' | 'xhr')[] | undefined;
}
