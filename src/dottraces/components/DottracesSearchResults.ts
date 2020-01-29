import { IDotTracesSelectedService } from '../services/IDotTracesSelectedService';

interface IDotTracesSearchResultsPanelBindings {
    [key: string]: any;

    transition: any;
    search: any;
    results: any;
    selected: any;
    _selectedIndex: any;
    onSearch: any;
}

const DotTracesSearchResultsPanelBindings: IDotTracesSearchResultsPanelBindings = {
    transition: '=?iqsTransation',
    search: '=iqsSearch',
    results: '=iqsResults',
    selected: '=?iqsSeletced',
    _selectedIndex: '=?iqsSelectedIndex',
    variants: '<?iqsVariants',
    onSearch: '&?iqsOnSearch'
}

class DotTracesSearchResultsPanelChanges implements ng.IOnChangesObject, IDotTracesSearchResultsPanelBindings {
    [key: string]: ng.IChangesObject<any>;

    transition: ng.IChangesObject<any>;
    variants: ng.IChangesObject<any>;
    search: ng.IChangesObject<any>;
    results: ng.IChangesObject<any>;
    selected: ng.IChangesObject<any>;
    _selectedIndex: ng.IChangesObject<any>;
    onSearch: ng.IChangesObject<any>;
}

class DotTracesSearchResultsPanelController implements IDotTracesSearchResultsPanelBindings {
    public transition: pip.services.Transaction;
    public results: any;
    public selected: any;
    public _selectedIndex: number = 0;
    public onSearch: any;

    public search: string;
    public defaultCollection: string[];
    public searchedCollection: string[];
    public variants: any[];

    private objectType: string = iqs.shell.SearchObjectTypes.ControlObject;

    constructor(
        private $element: JQuery,
        private $state: ng.ui.IStateService,
        private $interval: ng.IIntervalService,
        private $timeout: ng.ITimeoutService,
        private iqsObjectsRoutesViewModel: iqs.shell.IObjectsRoutesViewModel,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        private iqsDotTracesSelected: IDotTracesSelectedService
    ) {
        $element.addClass('iqs-dot-traces-search-results-panel');

        this.search = '';
        this.searchedCollection = this.iqsGlobalSearch.getSpecialSearchCollection(this.objectType);
    }

    private clearAll() {
        this._selectedIndex = 0;
        this.iqsDotTracesSelected.removeObjects();
    }

    public $onChanges(changes: DotTracesSearchResultsPanelChanges) {

    }

    public get isFocused(): boolean {
        return this.iqsObjectsRoutesViewModel.currentObjectId == this.searchResults[this._selectedIndex].id;
    }

    public get selectedIndex() {
        return Math.min(this.iqsDotTracesSelected.selectedObjects.length - 1, this._selectedIndex);
    }

    public onSearchResult(query: string) {
        if (!query) {
            this.clearAll();

            return;
        }

        this._selectedIndex = 0;
        this.iqsGlobalSearch.searchObjectsParallel(query, this.objectType,
            (data) => {
                switch (data.length) {
                    case 0: {
                        this.clearAll();
                        break;
                    }

                    default: {
                        this.iqsDotTracesSelected.setObjects(this.getObjects(data));
                    }
                }
            }
        );

        if (this.onSearch) {
            this.onSearch();
        }
    }

    public get searchResults() {
        return this.iqsDotTracesSelected.selectedObjects;
    }

    public get showResults() {
        return this.iqsDotTracesSelected.selectedObjects.length > 0;
    }

    public getObjects(data) {
        let objects = [];

        _.each(data, (item) => {
            objects.push(item.item);
        });

        return objects;
    }

    public focusCurrent() {
        if (!this.isFocused) {
            this.iqsObjectsRoutesViewModel.focus(this.searchResults[this._selectedIndex].id, null, true);
        }
    }

    public onCancelClick() {
        this.search = '';
        this.clearAll();
    }

    public onPrevClick() {
        if (this._selectedIndex > 0) {
            this._selectedIndex--;
            this.iqsObjectsRoutesViewModel.unfocus();
            this.$timeout(() => {
                this.iqsObjectsRoutesViewModel.focus(this.searchResults[this._selectedIndex].id, null, true);
            });
        }
    }

    public onNextClick() {
        if (this._selectedIndex < this.searchResults.length - 1) {
            this._selectedIndex++;
            this.iqsObjectsRoutesViewModel.unfocus();
            this.$timeout(() => {
                this.iqsObjectsRoutesViewModel.focus(this.searchResults[this._selectedIndex].id, null, true);
            });
        }
    }
}

(() => {
    angular
        .module('iqsDotTracesSearchResultsPanel', [
            'iqsObjectsRoutes.ViewModel',
            'iqsGlobalSearch',
            'iqsDotTracesSelected',
        ])
        .component('iqsDotTracesSearchResultsPanel', {
            bindings: DotTracesSearchResultsPanelBindings,
            templateUrl: 'dottraces/components/DottracesSearchResults.html',
            controller: DotTracesSearchResultsPanelController,
            controllerAs: '$ctrl'
        })
})();
