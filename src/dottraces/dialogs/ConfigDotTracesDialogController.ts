export class ConfigDotTracesDialogController implements ng.IController {
    public maxPointDownload: number = 1500;
    public startDate: Date;
    public endDate: Date;
    public search: string;
    public chosenResults: iqs.shell.SearchResult[] = [];
    public results: any;
    public variants: any[];
    public dialogState: string = 'dots';
    public startDateTimeChanged: Function;
    public endDateTimeChanged: Function;
    public entityType: string;
    public searchedCollection: any[];
    public defaultCollection: any[];
    public initCollection: any[];
    public collection: any[];
    public pointsCount: number = 0;
    // public justChangedData: boolean = false;

    public dateError: string = null;
    public downloadError: string = null;

    private debouncedGetCounts: Function;
    // private timeDiff: number;
    private dialogStates: string[] = ['dots', 'objects'];
    private objectType: string = iqs.shell.SearchObjectTypes.ControlObject;
    public detalizationLevel: string;
    public showPointWarning: boolean = false;

    public detalizationLevelCollection = [
        {
            id: 'high',
            title: 'DOTTRACE_DETALIZATION_HIGH'
        },
        {
            id: 'middle',
            title: 'DOTTRACE_DETALIZATION_MIDDLE'
        },
        {
            id: 'low',
            title: 'DOTTRACE_DETALIZATION_LOW'
        }
    ];

    constructor(
        public params: any,
        private $mdDialog: angular.material.IDialogService,
        private iqsGlobalSearch: iqs.shell.IGlobalSearchService,
        // private iqsObjectPositionsViewModel: IObjectPositionsViewModel,
        private iqsObjectsViewModel: iqs.shell.IObjectsViewModel,
        private iqsObjectGroupsViewModel: iqs.shell.IObjectGroupsViewModel,
        private pipToasts: pip.controls.IToastService,
        private pipTranslate: pip.services.ITranslateService
    ) {
        'ngInject';

        this.chosenResults = this.params.configResults;
        this.startDate = this.params.startDate ? new Date(Date.parse(this.params.startDate)) : this.nowDate(15);
        this.endDate = this.params.endDate ? new Date(Date.parse(this.params.endDate)) : this.nowDate();
        // this.timeDiff = this.endDate.getTime() - this.startDate.getTime();
        this.detalizationLevel = this.params.detalizationLevel || 'high';

        this.search = '';
        this.entityType = iqs.shell.SearchObjectTypes.ObjectsAndGroups;
        this.variants = _.cloneDeep(this.iqsObjectsViewModel.allObjects);
        _.each(this.iqsObjectGroupsViewModel.getCollection(), (item: iqs.shell.ObjectGroup) => {
            this.variants.push(item);
        })
        this.searchedCollection = this.iqsGlobalSearch.getSpecialSearchCollection(this.entityType);
        this.defaultCollection = this.iqsGlobalSearch.getDefaultCollection(this.entityType);
        this.initCollection = this.params.configResults ? _.uniq(this.params.configResults) : [];
        this.onSearchResult(this.search);

        this.startDateTimeChanged = (date) => {
            let now = this.nowDate();
            this.dateError = null;
            this.showPointWarning = false;

            if (date > now) {
                this.startDate = this.nowDate(15);
                this.endDate = now;
                this.pipToasts.showNotification(this.pipTranslate.translate('RETROSPECTIVE_END_HISTORY'),
                    ['ok'], () => { }, () => { }, '');
            } else {
                this.startDate = date;
                this.chekEndDate();
            }
        }

        this.endDateTimeChanged = (date) => {
            this.dateError = null;
            this.showPointWarning = false;
            let now = this.nowDate();

            if (date > now) {
                this.endDate = now;
                this.pipToasts.showNotification(this.pipTranslate.translate('RETROSPECTIVE_END_HISTORY'),
                    ['ok'], () => { }, () => { }, '');
            } else {
                this.endDate = date;
            }
            this.chekEndDate();

        }
    }

    public $onInit() { }

    public onAdd() {
        this.showPointWarning = false;
    }

    public chekEndDate() {
        if (!this.endDate) return;

        if (this.startDate >= this.endDate) {
            this.dateError = 'CONFIG_DOT_TRACES_DATE_RANGE_ERROR';
        }
    }

    public initSelectedItems() {
        this.collection.forEach((element, i) => {
            let index: number = _.findIndex(this.chosenResults, { id: element.id });
            this.collection[i].checked = index != - 1;
        });
    }

    // public get state() {
    //     return this.iqsObjectPositionsViewModel.state;
    // }

    public onSearchResult(query: string) {
        this.search = query;
        this.iqsGlobalSearch.searchObjectsParallel(query, this.entityType,
            (data) => {
                this.collection = data;
                this.initSelectedItems();
            });
    }

    private nowDate(withDelayMins: number = 0) {
        let now = new Date();
        now.setSeconds(0);
        now.setMilliseconds(0);
        now.setMinutes(now.getMinutes() - withDelayMins);

        return now;
    }

    public getVariants(search: string) {
        let res = _.filter(this.variants, (variant: any) => {
            return variant.name.toLowerCase().includes(search.toLowerCase()) ||
                variant.id.toLowerCase().includes(search.toLowerCase());
        });

        return _.difference(res, this.chosenResults);
    }

    public onCanselSearch() {
        this.search = '';
        this.onSearchResult(this.search);
    }

    private download() {
        this.$mdDialog.hide({
            results: this.chosenResults,
            startDate: this.startDate.toISOString(),
            endDate: this.endDate.toISOString(),
            openAnotherDialog: false
        });
    }

    public onDownloadAllClick() {
        this.download();

        // this.iqsObjectPositionsViewModel.setIdsAndDownload(this.getIds(), this.startDate.toISOString(), this.endDate.toISOString(), false, false,
        //     () => {
        //         this.download();
        //     },
        //     (error: any) => {
        //         this.downloadError = 'CONFIG_DOT_TRACES_DOWNLOAD_POINT_ERROR';
        //     });
    }

    public onDownloadClick() {
        this.pointsCount = null;
        this.showPointWarning = false;
        this.downloadError = null;
        this.download();
        // async.series([
        //     (callback) => {
        //         this.iqsObjectPositionsViewModel.getObjectsPositionsCount(this.startDate.toISOString(), this.endDate.toISOString(), this.getIds(),
        //             () => {
        //                 this.pointsCount = this.iqsObjectPositionsViewModel.countOfPoints;

        //                 if (this.pointsCount > this.maxPointDownload || this.pointsCount === 0) {
        //                     this.showPointWarning = true;
        //                     callback(new Error('Error'));
        //                 } else {
        //                     callback();
        //                 }
        //             });
        //     },
        //     (callback) => {
        //         this.iqsObjectPositionsViewModel.setIdsAndDownload(this.getIds(), this.startDate.toISOString(), this.endDate.toISOString(), false, false,
        //             () => {
        //                 callback();
        //             },
        //             (error: any) => {
        //                 this.downloadError = 'CONFIG_DOT_TRACES_DOWNLOAD_POINT_ERROR';
        //                 callback(error);
        //             });
        //     }
        // ], (error) => {
        //     if (error) return;

        //     this.download();
        // });
    }

    private getIds(): string[] {
        let ids = [];

        _.each(this.chosenResults, (item: any) => {
            if (item.object_ids) {
                ids = _.union(ids, item.object_ids);
            } else {
                ids.push(item.id);
            }
        });

        return ids;
    }

    public openObjectsAndGroupsState() {
        this.initSelectedItems();
        this.dialogState = this.dialogStates[1];
    }

    public onSetObjectsClick() {
        this.dialogState = this.dialogStates[0];
        this.chosenResults = [];
        this.search = '';
        _.each(this.collection, (item) => {
            if (item.checked) this.chosenResults.push(item.item);
        });
    }

    private onCloseClick() {
        this.chosenResults = [];
        this.$mdDialog.cancel();
    }

    public onCancelClick() {
        this.search = '';
        if (this.dialogState === this.dialogStates[0]) this.onCloseClick();
        else this.dialogState = this.dialogStates[0];
    }
}