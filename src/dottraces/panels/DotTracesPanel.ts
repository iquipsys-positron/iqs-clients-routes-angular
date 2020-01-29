declare var google: any;

import { ISearchDialogService } from '../../common';
import { IConfigDotTracesDialogService } from '../dialogs/IConfigDotTracesDialogService';
import { IDotTracesSelectedService } from '../services/IDotTracesSelectedService';

interface IDotTracesPanelBindings {
    [key: string]: any;
}

const DotTracesPanelBindings: IDotTracesPanelBindings = {}

class DotTracesPanelChanges implements ng.IOnChangesObject, IDotTracesPanelBindings {
    [key: string]: ng.IChangesObject<any>;
}

class DotTracesPanelController implements ng.IController {
    public $onInit() { }
    private intervalPromise: any;

    public polylinesOptions: any = {};
    public configurated: boolean = false;
    private startPause: boolean = true;
    public currentObject: any;

    public startDate: string;
    public endDate: string;
    private zoomLevel: number;
    public transaction: pip.services.Transaction;

    public configResults: any[] = [];
    private _objectIds: string[] = [];
    private detalizationLevel: string = 'high';
    public pointsOptions: any = {};
    public polylineOptions: any = {
        stroke: 'stroke',
        icons: [{
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 2
            },
            repeat: '50px'
        }],
        static: true,
        zIndex: 10
    };
    public zoneOptions: any = {
        fill: 'fill',
        stroke: 'stroke',
        radius: 'distance',
        zIndex: 9
    };

    private manualZoom: boolean = false;
    private cf: Function[] = [];

    constructor(
        private $state: ng.ui.IStateService,
        private $scope: ng.IScope,
        private $timeout: ng.ITimeoutService,
        private $interval: ng.IIntervalService,
        private $rootScope: any,
        private $location: ng.ILocationService,
        private iqsMapViewModel: iqs.shell.IMapViewModel,
        private iqsObjectsRoutesViewModel: iqs.shell.IObjectsRoutesViewModel,
        private iqsSearchDialog: ISearchDialogService,
        private iqsMapConfig: iqs.shell.IMapService,
        private iqsSmartZoom: iqs.shell.ISmartZoomService,
        private iqsConfigDotTracesDialog: IConfigDotTracesDialogService,
        private iqsDotTracesSelected: IDotTracesSelectedService,
        private pipTranslate: pip.services.ITranslateService,
        private pipTransaction: pip.services.ITransactionService,
        private pipToasts: pip.controls.IToastService,
        public pipMedia: pip.layouts.IMediaService,
        public iqsLoading: iqs.shell.ILoadingService
    ) {

        if (this.$location.search()['object_ids']) {
            this.iqsDotTracesSelected.setChosenVariantsByIds(this.$location.search()['object_ids'].split(','));
            this.configResults = this.iqsDotTracesSelected.chosenVariants;
        }

        if (this.$location.search()['start']) {
            this.startDate = this.$location.search()['start'];
        }

        if (this.$location.search()['end']) {
            this.endDate = this.$location.search()['end'];
        }

        this.pointsOptions.popup = {
            options: {
                setPosition: true
            },
            className: 'pip-map-info-top-margin',
            offset: {
                width: -165,
                height: 108
            },
            templateUrl: 'dottraces/DotTracesPopup.html',
        };

        this.pointsOptions.events = {
            'click': (eventObj: any) => {
                if (eventObj.model) {
                    this.focus(eventObj.model);
                }
            },
            'dblclick': (eventObj: any) => {
                if (eventObj.model) {
                    this.focus(eventObj.model);
                }
            }
        };

        this.zoneOptions.events = {
            'click': (eventObj: any) => {
                this.unfocus();
            },
            'dblclick': (eventObj: any) => {
                this.unfocus();
            }
        }

        this.zoneOptions.popup = {
            options: {
                setPosition: true,
                isZoneConfigure: false
            },
            offset: {
                width: -165,
                height: 108
                // height: this.type === 'retro' ? 108 : 35
            },
            className: 'pip-map-info-top-margin',
            // className: this.type === 'retro' ? 'pip-map-info-top-margin' : '',
            templateUrl: 'dottraces/DottraceZonePopup.html',

        };

        this.polylineOptions.popup = {
            options: {
                setPosition: true
            },
            className: 'pip-map-info-top-margin',
            offset: {
                width: -165,
                height: 108
            },
            templateUrl: 'dottraces/RoutePopup.html',
        };

        const runWhenReady = () => {
            this.iqsMapConfig.addEvent('click', () => {
                this.unfocus();
            });
            this.iqsMapViewModel.initMap();
            this.iqsMapConfig.watchDragAndZoom();
            this.iqsSmartZoom.activate();
            this.transaction = this.pipTransaction.create('DOTTRACE');

            $timeout(() => {
                this.openConfigDialog();
            }, 500);

            $timeout(() => {
                this.startPause = false;
            }, 100);

            this.zoomLevel = this.map.configs.zoom;
            this.iqsMapConfig.addZoomChangeCallback((zoom) => {
                this.zoomLevel = zoom;
            });
        };

        if (this.iqsLoading.isDone) { runWhenReady(); }
        this.cf.push($rootScope.$on(iqs.shell.LoadingCompleteEvent, runWhenReady.bind(this)));
    }

    private unfocus(): void {

        this.iqsObjectsRoutesViewModel.unfocus();
        this.$scope.$apply();
    }

    private focus(obj: any): void {
        let pos: iqs.shell.PositionShort = null;

        if (obj.latitude && obj.longitude) pos = {
            lat: obj.latitude,
            lng: obj.longitude
        };
        this.iqsObjectsRoutesViewModel.focus(obj.object_id, pos);
        this.$scope.$apply();
    }

    public get polygons(): any[] {
        return this.iqsMapViewModel.polygons;
    }

    public get lines(): any[] {
        return this.iqsMapViewModel.lines;
    }

    public get circles(): any[] {
        return this.iqsMapViewModel.circles;
    }

    private openConfigDialog() {
        this.iqsConfigDotTracesDialog.show(
            { configResults: this.configResults, startDate: this.startDate, endDate: this.endDate },
            (callbackData) => {
                if (callbackData) {

                    this.configurated = true;
                    this.setObjects(callbackData.results);
                    this.setData(callbackData.startDate, callbackData.endDate);

                    // load positions
                    this.onChangeDate(callbackData.startDate, callbackData.endDate, true, () => {
                        if (callbackData.results && callbackData.results.length == 1) {
                            this.$timeout(() => {
                                this.highlight(callbackData.results[0]);
                            }, 1000);
                        }
                    });
                }
            });
    }

    private highlight(item) {
        this.iqsDotTracesSelected.setObjects([item]);
    }

    public $onDestroy() {
        this.iqsDotTracesSelected.removeObjects();
        this.iqsMapConfig.removeEvent('click');
        this.iqsSmartZoom.deactivate();
        this.iqsObjectsRoutesViewModel.cleanUp();
        setTimeout(() => {
            this.iqsConfigDotTracesDialog.hide();
        }, 200);
        for (const f of this.cf) { f(); }
    }

    public get state(): string {
        return this.startPause ? 'progress' : this.map.state;
    }

    public get map() {
        return this.iqsMapViewModel.map;
    }

    public onZoomIn() {
        this.manualZoom = true;
        this.zoomLevel++;
        this.iqsMapViewModel.setZoom(this.zoomLevel);
    }

    public onZoomOut() {
        this.manualZoom = true;
        this.zoomLevel--;
        this.iqsMapViewModel.setZoom(this.zoomLevel);
    }

    public get isAdmin(): boolean {
        return true;
    }

    public goToGlobalMapSettings() {
        // this.$state.go('settings_system.global_settings.location');
        window.location.href = window.location.origin + `/config_organization/index.html#/organization/location`;
    }

    public get dottraces(): any {
        return this.iqsObjectsRoutesViewModel.objectPositions;
    }

    public get points(): any {
        return this.iqsObjectsRoutesViewModel.objectPoints;
    }

    public get objectsHeads(): any {
        return this.iqsObjectsRoutesViewModel.objectsHeads;
    }

    public onSearchObjectsClick() {
        this.iqsSearchDialog.show({ dataType: iqs.shell.SearchObjectTypes.ControlObject, dottraces: true }, (callbackData: any) => {
            if (callbackData.item) {
                this.highlight(callbackData.item);
            }
        });
    }

    public onSearchGroupsClick() {
        this.iqsSearchDialog.show({ dataType: iqs.shell.SearchObjectTypes.ObjectGroup, dottraces: true }, (callbackData: any) => {
            if (callbackData.item) {
                this.iqsDotTracesSelected.setObjectsByIds(callbackData.item.object_ids);
            }
        });
    }

    private setData(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.$location.search('start', startDate);
        this.$location.search('end', endDate);
    }

    private setObjects(results): void {
        this.configResults = results;
        this._objectIds = this.getIds();
        this.$location.search('object_ids', this._objectIds.slice(0, Math.min(this._objectIds.length, 9)).join(','));
        this.iqsDotTracesSelected.setChosenVariants(results);
    }

    public onChangeDate(startDate: string, endDate: string, isCentered?: boolean, callback?: () => void) {
        this.startDate = startDate;
        this.endDate = endDate;

        let toTime: Date = moment(endDate).toDate();
        let fromTime: Date = moment(startDate).toDate();
        this.transaction.begin('GET_TRECE');
        this.iqsObjectsRoutesViewModel.readObjectPositions(toTime, fromTime, this._objectIds, isCentered,
            (data: any) => {
                this.transaction.end();
                if (this.iqsObjectsRoutesViewModel.positionsZoom) {
                    this.zoomLevel = this.iqsObjectsRoutesViewModel.positionsZoom;
                    this.iqsMapViewModel.setZoom(this.zoomLevel);
                }
                if (callback) callback();
            },
            (error: any) => {
                this.transaction.end(error);
                this.pipToasts.showError(this.pipTranslate.translate('DOTTRACE_ERROR_LOAD_OBJECT_POSITION'),
                    ['ok'], () => { }, null, error);
            }
        );
    }

    public onEditClick() {
        this.openConfigDialog();
    }

    private getIds(): string[] {
        let ids = [];

        _.each(this.configResults, (item: any) => {
            if (item.object_ids) {
                ids = _.union(ids, item.object_ids);
            } else {
                ids.push(item.id);
            }
        });

        return ids;
    }

    public onDottraceCancel() {
        this.iqsObjectsRoutesViewModel.cancelDownloading();
        this.transaction.abort();
    }
}

(() => {
    angular
        .module('iqsDotTracesPanel', [
            'iqsRoutePositionPanel',
            'iqsMap.ViewModel',
            'iqsObjectsRoutes.ViewModel',
            'iqsSearchDialog',
            'iqsMapConfig',
            'iqsSmartZoom',
            'iqsConfigDotTracesDialog',
            'iqsDotTracesSelected'

        ])
        .component('iqsDotTracesPanel', {
            bindings: DotTracesPanelBindings,
            templateUrl: 'dottraces/panels/DotTracesPanel.html',
            controller: DotTracesPanelController,
            controllerAs: '$ctrl'
        })
})();
