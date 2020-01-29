export interface ISearchDialogService {
    show(params: any, successCallback?: (settingsName: string) => void, cancelCallback?: () => void): any;
}