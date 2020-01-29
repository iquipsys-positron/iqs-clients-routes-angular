class SearchDialogTitles {
    public static control_object: string = 'SEARCH_DIALOG_TITLE_CONTROL_OBJECTS';
    public static location: string = 'SEARCH_DIALOG_TITLE_LOCATIONS';
    public static object_group: string = 'SEARCH_DIALOG_TITLE_GROUPS';
    public static zone: string = 'SEARCH_DIALOG_TITLE_ZONES';
}

class SearchDialogStrings {
    public static control_object: string = 'FIND_OBJECTS';
    public static location: string = 'FIND_LOCATIONS';
    public static object_group: string = 'FIND_GROUPS';
    public static zone: string = 'FIND_ZONES';
}

class SearchDialogNoDataStrings {
    public static control_object: string = 'SEARCH_DIALOG_NO_OBJECTS';
    public static location: string = 'SEARCH_DIALOG_NO_LOCATIONS';
    public static object_group: string = 'SEARCH_DIALOG_NO_GROUPS';
    public static zone: string = 'SEARCH_DIALOG_NO_ZONES';
}

export class SearchDialogController implements ng.IController {          public $onInit() {}
    public theme: string;
    public dataType: string;
    public dialogTitle: string;
    public dialogSearch: string;
    public noDataText: string;
    public results: any[];

    public search: string;
    public defaultCollection: string[];
    public searchedCollection: string[];
    private defaultVariants: any[];

    public index: number = null;
    private excludeCollection: string[];

    constructor(
        public params: any,
        private $mdDialog: angular.material.IDialogService,
        private iqsStatesViewModel: iqs.shell.IStatesViewModel,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        private pipTranslate: pip.services.ITranslateService,
        private pipToasts: pip.controls.IToastService,
        $rootScope
    ) {
        'ngInject';

        this.dataType = params.dataType ? params.dataType : iqs.shell.SearchObjectTypes.ControlObject;
        this.theme = $rootScope.$theme;
        this.dialogTitle = SearchDialogTitles[this.dataType];
        this.dialogSearch = SearchDialogStrings[this.dataType];
        this.noDataText = SearchDialogNoDataStrings[this.dataType];
        this.defaultVariants = params.defaultVariants || [];
        this.iqsGlobalSearch.init();
        this.search = '';
        this.searchedCollection = params.searchedCollection || this.iqsGlobalSearch.getSpecialSearchCollection(this.dataType);
        this.defaultCollection = this.iqsGlobalSearch.getDefaultCollection(this.dataType);

        this.excludeCollection = params.excludeCollection ? params.excludeCollection : [];

        this.initData();
    }

    private filtered(data: iqs.shell.SearchResult[], fCollection: string[], dataType: string): iqs.shell.SearchResult[] {
        if (!fCollection || fCollection.length == 0) return data;
        if (dataType !== iqs.shell.SearchObjectTypes.ControlObject && dataType !== iqs.shell.SearchObjectTypes.ObjectsAndGroups) return data;

        let result: iqs.shell.SearchResult[];

        result = _.filter(data, (item: iqs.shell.SearchResult) => {
            if (item.object_type == iqs.shell.SearchObjectTypes.ObjectGroup) return true;


            return fCollection.indexOf(item.id) == -1;
        });

        return result;
    }

    private initData() {
        if (this.params.searchedCollection) {
            this.results = this.params.searchedCollection;
        } else {
            this.iqsGlobalSearch.searchObjectsParallel(this.pipTranslate.translate('GLOBAL_SEARCH_ALL').toLocaleLowerCase(), this.dataType,
                (data: iqs.shell.SearchResult[]) => {
                    this.results = this.filtered(data, this.excludeCollection, this.dataType);
                    this.addDefVariants();
                }
            );
        }
    }

    private addDefVariants() {
        _.each(this.defaultVariants, (variant) => {
            this.results.unshift(variant);
        });
    }

    public onCanselSearch() {
        this.search = null;
        this.initData();
    }

    public onSearchResult(query) {
        this.index = null;

        if (!query) {
            this.initData();

            return;
        }

        this.iqsGlobalSearch.searchObjectsParallel(query, this.dataType,
            (data) => {
                this.results = this.filtered(data, this.excludeCollection, this.dataType);
            }
        );
    }

    public selectedObject(index) {
        return this.index === index;
    }

    public onClose(): void {
        this.$mdDialog.cancel();
    }

    public onItemClick(index) {
        this.index = index;
    }

    public onChoose() {
        const item = this.results[this.index];
        if (!this.params.dottraces) {
            if ((this.dataType === iqs.shell.SearchObjectTypes.ControlObject) &&
                (!item.item.device_id || !this.isOnMap(item.item.id))) {
                this.pipToasts.showNotification(this.pipTranslate.translate('OBJECT') + ' ' + item.item.name + ' ' + this.pipTranslate.translate('NOT_FOUND'),
                    ['ok'], () => { }, () => { }, '');

                this.$mdDialog.hide({});

                return;
            }

            if ((this.dataType === iqs.shell.SearchObjectTypes.ObjectGroup) &&
                (item.item.object_ids.length === 0 || !this.areOnMap(item.item.object_ids))) {
                this.pipToasts.showNotification(this.pipTranslate.translate('OBJECTS_OF_GROUP') + ' ' 
                    + item.item.name + ' ' + this.pipTranslate.translate('NOT_FOUND_GROUP'),
                    ['ok'], () => { }, () => { }, '');

                this.$mdDialog.hide({});

                return;
            }
        }

        this.$mdDialog.hide({ item: item.item ? item.item : item, dataType: this.dataType });
    }

    private isOnMap(object_id) {
        return this.iqsStatesViewModel.isOnMapByObjectId(object_id);
    }

    private areOnMap(object_ids) {
        let onMap = false;

        _.each(object_ids, (object_id) => {
            if (this.iqsStatesViewModel.isOnMapByObjectId(object_id)) {
                onMap = true;
            }
        });

        return onMap;
    }

    public isAvatar() {
        return this.dataType !== iqs.shell.SearchObjectTypes.Location && this.dataType !== iqs.shell.SearchObjectTypes.ObjectGroup;
    }
}