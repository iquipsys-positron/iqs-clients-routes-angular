interface IDottracesDataTimePanelBindings {
    [key: string]: any;

    localStartDate: any;
    localEndDate: any;
    changeDate: any;
    class: any;
    changePlay: any;
    play: any;
    edit: any;
    cancel: any;
}

const DottracesDataTimePanelBindings: IDottracesDataTimePanelBindings = {
    localStartDate: '<?iqsStartDate',
    localEndDate: '<?iqsEndDate',
    changeDate: '&?iqsChange',
    class: '<?iqsClass',
    changePlay: '&?iqsChangePlay',
    play: '<?iqsPlay',
    edit: '&?iqsEdit',
    cancel: '&iqsCancel'
}

class DottracesDataTimePanelChanges implements ng.IOnChangesObject, IDottracesDataTimePanelBindings {
    [key: string]: ng.IChangesObject<any>;

    localStartDate: ng.IChangesObject<string>;
    localEndDate: ng.IChangesObject<string>;
    class: ng.IChangesObject<string>;
    play: ng.IChangesObject<boolean>;
    changeDate: ng.IChangesObject<(string) => void>;
    changePlay: ng.IChangesObject<(boolean) => void>;
    edit: ng.IChangesObject<() => void>;
    cancel: ng.IChangesObject<() => void>;
}

class DottracesDataTimePanelController implements ng.IController {          
    public date: Date;
    public localStartDate: string;
    public localEndDate: string;
    public dateEnd: Date;
    public interval: number = 15; // min count
    public play: boolean = true;
    public edit: () => void;
    public cancel: () => void;
    public changeDate: (string) => void;
    public changePlay: (boolean) => void;
    public class: string = 'iqs-black';

    public cleanUpFunc: Function;

    constructor(
        private $element: JQuery,
        public pipMedia: pip.layouts.IMediaService,
        private iqsObjectsRoutesViewModel: iqs.shell.IObjectsRoutesViewModel,
        private pipToasts: pip.controls.IToastService,
        private pipTranslate: pip.services.ITranslateService,
        $scope: ng.IScope,
        $interval: ng.IIntervalService
    ) { 

        $element.addClass('iqs-dottraces-data-time-panel');
    }

    public $onDestroy() {
        
    }

    public $onChanges(changes: IDottracesDataTimePanelBindings) {
        if (changes.localStartDate && this.localStartDate) {
            this.date = new Date(Date.parse(this.localStartDate));
            if (this.dateEnd) this.interval = ((this.dateEnd.getTime() - this.date.getTime()) / (1000 * 60));

            this.localStartDate = this.date.toISOString();
        }

        if (changes.localEndDate && this.localEndDate) {
            this.dateEnd = new Date(Date.parse(this.localEndDate));
            if (this.date) this.interval = ((this.dateEnd.getTime() - this.date.getTime()) / (1000 * 60));

            this.localEndDate = this.dateEnd.toISOString();
        }
    }

    public $onInit() {
        this.date = this.localStartDate ? new Date(Date.parse(this.localStartDate)) : null;
        if (this.date) this.localStartDate = this.date.toISOString();
        this.dateEnd = this.localEndDate ? new Date(Date.parse(this.localEndDate)) : null;
        if (this.dateEnd) this.localEndDate = this.dateEnd.toISOString();
    }

    public next() {
        let now = new Date();
        this.dateEnd.setMinutes(this.dateEnd.getMinutes() + this.interval);
        if (this.dateEnd > now) {
            let interval = this.interval - ((this.dateEnd.getTime() - now.getTime()) / (1000 * 60));
            this.date.setMinutes(this.date.getMinutes() + interval);
            this.dateEnd = now;

            this.pipToasts.showNotification(this.pipTranslate.translate('RETROSPECTIVE_END_HISTORY'),
                ['ok'], () => { }, () => { }, '');
        } else {
            this.date.setMinutes(this.date.getMinutes() + this.interval);
        }

        this.localStartDate = this.date.toISOString();
        this.localEndDate = this.dateEnd.toISOString();
        if (this.changeDate) {
            this.changeDate({ startDate: this.localStartDate, endDate: this.localEndDate });
        }
    }

    public prev() {
        this.date.setMinutes(this.date.getMinutes() - this.interval);
        this.localStartDate = this.date.toISOString();

        this.dateEnd.setMinutes(this.dateEnd.getMinutes() - this.interval);
        this.localEndDate = this.dateEnd.toISOString();
        if (this.changeDate) {
            this.changeDate({ startDate: this.localStartDate, endDate: this.localEndDate });
        }
    }

    public onEditClick() {
        if (this.edit) {
            this.edit();
        }
    }

    public onCancelClick() {
        if (this.cancel) this.cancel();
    }

    public get state() {
        return this.iqsObjectsRoutesViewModel.state;
    }

    public get loadingObjectsCount() {
        // return this.iqsObjectPositionsViewModel.loadingObjectsCount;
        return 0;
    }

}

(() => {
    angular
        .module('iqsDottracesDataTimePanel', [
            'iqsObjectsRoutes.ViewModel'
        ])
        .component('iqsDottracesDataTimePanel', {
            bindings: DottracesDataTimePanelBindings,
            templateUrl: 'dottraces/components/DottracesDataTime.html',
            controller: DottracesDataTimePanelController,
            controllerAs: '$ctrl'
        })

})();
