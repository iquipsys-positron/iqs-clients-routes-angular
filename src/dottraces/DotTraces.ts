export const DottracesStateName: string = 'app';

class DotTracesController implements ng.IController {
    public $onInit() { }
    private cf: Function[] = [];

    constructor(
        $rootScope: ng.IRootScopeService,
        private $window: ng.IWindowService,
        $scope: ng.IScope,
        $state: ng.ui.IStateService,
        private pipMedia: pip.layouts.IMediaService,
        $injector: angular.auto.IInjectorService,
        private pipNavService: pip.nav.INavService
    ) {
        "ngInject";

        this.appHeader();
        this.cf.push($rootScope.$on(pip.services.IdentityChangedEvent, this.appHeader.bind(this)));
        this.cf.push($rootScope.$on('pipMainResized', this.appHeader.bind(this)));
    }

    public $onDestroy() {
        for (const f of this.cf) { f(); }
    }

    private appHeader(): void {
        this.pipNavService.appbar.addShadow();
        this.pipNavService.actions.hide();
        this.pipNavService.breadcrumb.text = 'DOTTTRACE';
        this.pipNavService.appbar.removeShadow();
        this.pipNavService.appbar.parts = { 'icon': true, 'actions': 'primary', 'menu': true, 'title': 'breadcrumb', 'organizations': this.pipMedia('gt-sm') };
    }

    public onRetry() {
        this.$window.history.back();
    }
}

function configureDotTracesRoute(
    $injector: angular.auto.IInjectorService,
    $stateProvider: pip.rest.IAuthStateService
) {
    "ngInject";

    $stateProvider
        .state(DottracesStateName, {
            url: '/dottraces?start&end&object_ids',
            auth: true,
            reloadOnSearch: false,
            views: {
                '@': {
                    controller: DotTracesController,
                    controllerAs: '$ctrl',
                    templateUrl: 'dottraces/DotTraces.html'
                }
            }
        });
}

function configureDotTracesAccess(
    iqsAccessConfigProvider: iqs.shell.IAccessConfigProvider
) {
    "ngInject";

    let accessLevel: number = iqs.shell.AccessRole.user;
    let accessConfig: any = {}

    iqsAccessConfigProvider.registerStateAccess(DottracesStateName, accessLevel);
    iqsAccessConfigProvider.registerStateConfigure(DottracesStateName, accessConfig);
}

function configureDotTracesTranslations(
    pipTranslateProvider: pip.services.ITranslateProvider
) {
    pipTranslateProvider.translations('ru', {
        'CONFIG_DOT_TRACES_SET_TIME_INTERVAL': 'Выберите интервал',
        // 'CONFIG_DOT_TRACES_DOWNLOADING_OBJECTS': 'Загружено объектов ',
        'CONFIG_DOT_TRACES_DOWNLOADING_OBJECTS': 'Загружаются пути следования ',
        'CONFIG_DOT_TRACES_FROM': ' из ',
        OBJECTS_NOT_FOUND: 'Объекты не найдены',
        PARKING_TIME: 'Время стоянки',
        STOPING_TIME: 'Время отстановки',
        DOTTRACE_ERROR_LOAD_OBJECT_POSITION: 'Ошибка загрузки путей следования',
        CONTROL_OBJECTS: 'Объекты контроля',
        GROUPS: 'Группы',
        MAP_LOADING: 'Загрузка карты...',
        NO_MAP_DATA: 'Местоположение площадки неизвестно',
        CONTACT_THE_ADMINISTRATOR: 'Свяжитесь с администратором',
        CONFIG_GLOBAL_MAP_SETTINGS: 'Настройте местоположение площадки',
        GO_TO_GLOBAL_MAP_SETTINGS: 'Настройки местоположения площадки',
        FIND_OBJECTS: 'Найти объекты...',
        DOTTTRACE: 'Пути следования',
        UPDATE_TIME: 'Время',
        LATITUDE: 'Широта',
        LONGITUDE: 'Долгота',
        ALTITUDE: 'Высота',
    });

    pipTranslateProvider.translations('en', {
        'CONFIG_DOT_TRACES_SET_TIME_INTERVAL': 'Set time interval',
        // 'CONFIG_DOT_TRACES_DOWNLOADING_OBJECTS': 'Downloading objects ',
        'CONFIG_DOT_TRACES_DOWNLOADING_OBJECTS': 'Dottrace loading ',
        'CONFIG_DOT_TRACES_FROM': ' from ',
        OBJECTS_NOT_FOUND: 'Objects not found',
        PARKING_TIME: 'Parking time',
        STOPING_TIME: 'Stoping time',
        DOTTRACE_ERROR_LOAD_OBJECT_POSITION: 'Dottrace loading error',
        CONTROL_OBJECTS: 'Control objects',
        GROUPS: 'Groups',
        MAP_LOADING: 'Loading map...',
        NO_MAP_DATA: 'Organization location is not set',
        CONTACT_THE_ADMINISTRATOR: 'Contact the administrator',
        CONFIG_GLOBAL_MAP_SETTINGS: 'Set the organization location',
        GO_TO_GLOBAL_MAP_SETTINGS: 'Organization location settings',
        FIND_OBJECTS: 'Find objects...',
        DOTTTRACE: 'Dot traces',
        UPDATE_TIME: 'Time',
        LATITUDE: 'Latitude',
        LONGITUDE: 'Longitude',
        ALTITUDE: 'Altitude',
    });
}

(() => {

    angular
        .module('iqsDottraces', [
            'pipNav',
            'iqsDottracesDataTimePanel',
            'iqsDotTracesPanel',
            'iqsDotTracesSearchResultsPanel',
            'iqsConfigDotTracesDialog',
            'iqsDotTracesSelected'
        ])
        .config(configureDotTracesRoute)
        .config(configureDotTracesTranslations)
        .config(configureDotTracesAccess);

})();
