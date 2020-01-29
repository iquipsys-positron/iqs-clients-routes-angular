export interface IConfigDotTracesDialogService {
    show(params: any, successCallback?: (...params) => void, cancelCallback?: () => void): any;
    hide(): any;
}