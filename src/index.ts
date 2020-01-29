/// <reference path="../typings/tsd.d.ts" />
import './dottraces/DotTraces';

class PositronDottracesAppController implements ng.IController {
    public $onInit() { }
    public isChrome: boolean;

    constructor(
        $rootScope: ng.IRootScopeService,
        $state: ng.ui.IStateService,
        pipSystemInfo: pip.services.ISystemInfo,
    ) {
        "ngInject";

        this.isChrome = pipSystemInfo.browserName == 'chrome' && pipSystemInfo.os == 'windows';
    }
}

angular
    .module('iqsPositronDottracesApp', [
        'iqsPositronDottraces.Config',
        'iqsPositronDottraces.Templates',
        'iqsOrganizations.Service',
        'iqsDottraces'
    ])
    .controller('iqsPositronDottracesAppController', PositronDottracesAppController);


