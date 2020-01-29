import { SearchDialogController } from './SearchDialogController';
import { ISearchDialogService } from './ISearchDialogService';

class SearchDialogService implements ISearchDialogService {
    public _mdDialog: angular.material.IDialogService;
    public constructor($mdDialog: angular.material.IDialogService) {
        this._mdDialog = $mdDialog;
    }
    public show(params, successCallback?: (settingsName: string) => void, cancelCallback?: () => void) {
        this._mdDialog.show({
            targetEvent: params.event,
            templateUrl: 'common/dialogs/search/SearchDialog.html',
            controller: SearchDialogController,
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

}

function configTranslations(pipTranslateProvider: pip.services.ITranslateProvider) {
    pipTranslateProvider.translations('ru', {
        'SEARCH_DIALOG_TITLE_CONTROL_OBJECTS': 'Выбрать объект',
        'SEARCH_DIALOG_TITLE_LOCATIONS': 'Выбрать место',
        'SEARCH_DIALOG_TITLE_GROUPS': 'Выбрать группу',
        'SEARCH_DIALOG_TITLE_ZONES': 'Выбрать зону',
        'NO_SEARCH_DIALOG_DATA': 'Нет результатов. Попробуйте поменять критерии поиска',
        'CHOOSE': 'Выбрать',
        'CANCEL': 'Отмена',
        'FIND_LOCATIONS': 'Найти места...',
        'FIND_GROUPS': 'Найти группы...',
        'FIND_ZONES': 'Найти зоны...',
        'FIND': 'Найти',
        'OBJECT': 'Объект',
        'OBJECTS_OF_GROUP': 'Объекты группы',
        'NOT_FOUND': 'не найден',
        'NOT_FOUND_GROUP': 'не найдены',
        'SEARCH_DIALOG_NO_OBJECTS': 'Объекты не найдены',
        'SEARCH_DIALOG_NO_LOCATIONS': 'Места не найдены',
        'SEARCH_DIALOG_NO_GROUPS': 'Группы не найдены',
        'SEARCH_DIALOG_NO_ZONES': 'Зоны не найдены'
    });

    pipTranslateProvider.translations('en', {
        'SEARCH_DIALOG_TITLE_CONTROL_OBJECTS': 'Select object',
        'SEARCH_DIALOG_TITLE_LOCATIONS': 'Select location',
        'SEARCH_DIALOG_TITLE_GROUPS': 'Select group',
        'SEARCH_DIALOG_TITLE_ZONES': 'Select zone',
        'NO_SEARCH_DIALOG_DATA': 'Nothing was found. Try to change search criteria',
        'CHOOSE': 'Select',
        'CANCEL': 'Cancel',
        'FIND_LOCATIONS': 'Find locations...',
        'FIND_GROUPS': 'Find groups...',
        'FIND_ZONES': 'Find zones...',
        'FIND': 'Find',
        'OBJECT': 'Object',
        'OBJECTS_OF_GROUP': 'Objects of group',
        'NOT_FOUND_GROUP': 'not found',
        'NOT_FOUND': 'not found',
        'SEARCH_DIALOG_NO_OBJECTS': 'Objects were not found',
        'SEARCH_DIALOG_NO_LOCATIONS': 'Locations were not found',
        'SEARCH_DIALOG_NO_GROUPS': 'Groups were not found',
        'SEARCH_DIALOG_NO_ZONES': 'Zones were not found'
    });
}


angular
    .module('iqsSearchDialog', [
        'iqsGlobalSearch',
        'iqsStates.ViewModel'
    ])
    .config(configTranslations)
    .service('iqsSearchDialog', SearchDialogService);