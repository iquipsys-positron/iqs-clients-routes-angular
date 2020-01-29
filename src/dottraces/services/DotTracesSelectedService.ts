import { IDotTracesSelectedService } from './IDotTracesSelectedService';

class DotTracesSelectedService implements IDotTracesSelectedService {
    private _selectedObjects: any[] = [];
    private _chosenVariants: any[] = [];
    private _chosenVariantsIds: string[] = [];

    constructor(
        private iqsObjectsRoutesViewModel: iqs.shell.IObjectsRoutesViewModel,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private pipTranslate: pip.services.ITranslateService,
        private pipToasts: pip.controls.IToastService
    ) {
        "ngInject";
    }

    public get selectedObjects() {
        return this._selectedObjects;
    }

    public get chosenVariants() {
        return this._chosenVariants;
    }

    public get chosenVariantsIds() {
        return this._chosenVariantsIds;
    }

    public setChosenVariants(objects) {
        this.removeObjects();
        this._chosenVariants = objects;
        this._chosenVariantsIds = this.getIds(this._chosenVariants);
    }

    public setChosenVariantsByIds(ids) {
        let objects = [];
        _.each(ids, (id) => {
            const obj = this.iqsObjectsViewModel.getObjectById(id);
            if (obj) objects.push(obj);
        });

        this.setChosenVariants(objects);
    }

    public setObjects(objects) {
        if (!objects || objects.length === 0) return;
        this.removeObjects();
        _.each(objects, (object) => {
            if (this._chosenVariantsIds.includes(object.id) && this.iqsObjectsRoutesViewModel.isPointsOnMap(object.id)) {
                this._selectedObjects.push(object);
            }
        });

        if (this._selectedObjects.length > 0) {
            this.iqsObjectsRoutesViewModel.focus(this._selectedObjects[0].id, null, true);
        } else if (!objects.length || !Array.isArray(objects[0].object_ids) || !objects[0].object_ids.length) {
            if (objects.length === 1) {
                this.pipToasts.showNotification(this.pipTranslate.translate('OBJECT') + ' ' + objects[0].name + ' ' + this.pipTranslate.translate('NOT_FOUND'),
                    ['ok'], () => { }, () => { }, '');
            } else {
                this.pipToasts.showNotification(this.pipTranslate.translate('OBJECTS_NOT_FOUND'),
                    ['ok'], () => { }, () => { }, '');
            }
        }
    }

    public setObjectsByIds(ids) {
        let objects = [];
        _.each(ids, (id) => {
            const obj = this.iqsObjectsViewModel.getObjectById(id);
            if (obj) objects.push(obj);
        });

        this.setObjects(objects);
    }

    public removeObjects() {
        this._selectedObjects = [];
        this.iqsObjectsRoutesViewModel.unfocus();
    }

    private getIds(objects): string[] {
        let ids = [];

        _.each(objects, (item: any) => {
            if (item.object_ids) {
                ids = _.union(ids, item.object_ids);
            } else {
                ids.push(item.id);
            }
        });

        return ids;
    }

}

{
    angular.module('iqsDotTracesSelected', [
        'iqsObjectsRoutes.ViewModel',
        'iqsObjects.ViewModel',
    ])
        .service('iqsDotTracesSelected', DotTracesSelectedService);
}
