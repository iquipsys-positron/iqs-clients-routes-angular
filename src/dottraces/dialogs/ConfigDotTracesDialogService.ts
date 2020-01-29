import { ConfigDotTracesDialogController } from './ConfigDotTracesDialogController';
import { IConfigDotTracesDialogService } from './IConfigDotTracesDialogService';

class ConfigDotTracesDialogService implements IConfigDotTracesDialogService {
    public _mdDialog: angular.material.IDialogService;
    public constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
    }
    public show(params, successCallback?: (callbackData) => void, cancelCallback?: () => void) {
        this._mdDialog.show({
            targetEvent: params.event,
            templateUrl: 'dottraces/dialogs/ConfigDotTracesDialog.html',
            controller: ConfigDotTracesDialogController,
            controllerAs: '$ctrl',
            locals: { params: params },
            clickOutsideToClose: true
        })
            .then((callbackData: any) => {
                if (successCallback) {
                    successCallback(callbackData);
                }
            }, () => {
                if (cancelCallback) {
                    cancelCallback();
                }
            });

    }

    public hide() {
        this._mdDialog.hide();
    }

}

function configTranslations(pipTranslateProvider: pip.services.ITranslateProvider) {
    pipTranslateProvider.translations('ru', {
        'CONFIG_DOT_TRACES_TITLE': 'Интервал времени и объекты',
        'CONFIG_DOT_TRACES_START': 'Время начала',
        'CONFIG_DOT_TRACES_END': 'Время конца',
        'CONFIG_DOT_TRACES_OBJECTS': 'Выберете объекты',
        'CONFIG_DOT_TRACES_ALL': 'Всего точек',
        // 'CONFIG_DOT_TRACES_RECOMENDATIONS': 'Превышает максимальное количество(2500)',
        'CONFIG_DOT_TRACES_RECOMENDATIONS': 'Уровень детализации будет снижен до 1500 точек.',
        'CONFIG_DOT_TRACES_DOWNLOAD': 'Начать',
        'CONFIG_DOT_TRACES_DOWNLOAD_ALL': 'Продолжить',
        'CONFIG_DOT_TRACES_SET': 'Выбрать',
        'CONFIG_DOT_TRACES_NO_POINTS': 'Нет точек для объектов в указанном промежутке времени',
        DOTTRACE_DETALIZATION_HIGH: 'Высокая',
        DOTTRACE_DETALIZATION_MIDDLE: 'Средняя',
        DOTTRACE_DETALIZATION_LOW: 'Низкая',
        DOTTRACE_DETALISATION_LABEL: 'Уровень детализации',
        CONFIG_DOT_TRACES_DATE_RANGE_ERROR: 'Ошибка. Время конца диапазона должно быть больше времени начала'
    });

    pipTranslateProvider.translations('en', {
        'CONFIG_DOT_TRACES_TITLE': 'Time interval and objects',
        'CONFIG_DOT_TRACES_START': 'Start time',
        'CONFIG_DOT_TRACES_END': 'End time',
        'CONFIG_DOT_TRACES_OBJECTS': 'Select objects',
        'CONFIG_DOT_TRACES_ALL': 'Total points',
        // 'CONFIG_DOT_TRACES_RECOMENDATIONS': 'Exceeds maximum number(2500)',
        'CONFIG_DOT_TRACES_RECOMENDATIONS': 'The level of detailization will be reduced to 1500 points.',
        'CONFIG_DOT_TRACES_DOWNLOAD': 'Start',
        'CONFIG_DOT_TRACES_DOWNLOAD_ALL': 'Continue',
        'CONFIG_DOT_TRACES_SET': 'Set',
        'CONFIG_DOT_TRACES_NO_POINTS': 'There are no points for the objects in the specified time interval',
        DOTTRACE_DETALIZATION_HIGH: 'High',
        DOTTRACE_DETALIZATION_MIDDLE: 'Middle',
        DOTTRACE_DETALIZATION_LOW: 'Low',
        DOTTRACE_DETALISATION_LABEL: 'Detalization level',
        CONFIG_DOT_TRACES_DATE_RANGE_ERROR: 'Error. Time end of the range must be greater than the start time'
    });
}


angular
    .module('iqsConfigDotTracesDialog', ['pipTimeAutocomplete'])
    .config(configTranslations)
    .service('iqsConfigDotTracesDialog', ConfigDotTracesDialogService);