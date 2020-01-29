class RoutePositionPanelController implements ng.IController {         
    public parameter: any;
    public model: iqs.shell.MapPoint

    constructor(
        private $element: JQuery
    ) {
        "ngInject";
        $element.addClass('iqs-route-position-panel');


    }

    public $onChanges(changes) {
        if (changes.parameter && changes.parameter.currentValue) {
            this.updateState(changes.parameter);
        }
    }

    public $onInit() {

    }

    public $onDestroy() {

    }

    private dataNotChange(parameter: any): boolean {
        return parameter.previousValue && parameter.currentValue &&
        parameter.previousValue.model && parameter.currentValue.model &&
        parameter.previousValue.model.id !== parameter.currentValue.model.id && 
        parameter.previousValue.position && parameter.currentValue.position && 
        parameter.previousValue.position.latitude && parameter.currentValue.position.latitude && 
        parameter.previousValue.position.longitude && parameter.currentValue.position.longitude;
    }

    private updateState(parameter) {
       if (this.dataNotChange(parameter)) return;
        if (!this.parameter || !this.parameter.model || !this.parameter.position) {
            this.model = null;

            return;
        }
        this.model = iqs.shell.RouteVisualization.getRoutInfo(this.parameter.model, this.parameter.position);
    }

}

(() => {
    angular
        .module('iqsRoutePositionPanel', [])
        .component('iqsRoutePositionPanel', {
            bindings: {
                parameter: '<parameter',
            },
            templateUrl: 'common/panels/map/route_position/RoutePositionPanel.html',
            controller: RoutePositionPanelController,
            controllerAs: '$ctrl'
        })
})();
