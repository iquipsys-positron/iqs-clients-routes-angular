interface ITimeAutocompleteBindings {
    [key: string]: any;

    ngDisabled: any;
    date: any;
    timeStep: any;
    changeCallback: any;
    timeLabel: any;
    placeholder: any;
    fontSize: any;
}

const TimeAutocompleteBindings: ITimeAutocompleteBindings = {

    ngDisabled: '<?',
    date: '<pipDateTime',
    timeStep: '<pipTimeStep',
    changeCallback: '=?pipChangeCallback',
    timeLabel: '<?pipTimeLabel',
    placeholder: '<?pipTimePlaceholder',
    fontSize: '<?pipSelectFontSize'
}

class TimeAutocompleteChanges implements ng.IOnChangesObject, ITimeAutocompleteBindings {
    [key: string]: ng.IChangesObject<any>;

    ngDisabled: ng.IChangesObject<boolean>;
    // ISO string
    date: ng.IChangesObject<any>;
    // into minutes
    timeStep: ng.IChangesObject<number>;
    changeCallback: ng.IChangesObject<(date?: Date) => ng.IPromise<void>>;
    timeLabel: ng.IChangesObject<string>;
    placeholder: ng.IChangesObject<string>;
    fontSize: ng.IChangesObject<number>;
}
class TimeAutocompleteOptions {
    public static Hours: number = 24;
    public static Minutes: number = 60;
    public static Seconds: number = 60;
    public static MlSeconds: number = 1000;
    public static DefaultStep: number = 15;
}

class TimeAutocompleteController implements ng.IController {
    private initialDate: Date;
    private isScrolled: boolean = false;
    private year: number;
    private month: number;
    private day: number;
    private panelElement: any;
    private panelHTMLElement: any;
    private backdropElement: any;


    public ngDisabled: boolean;
    public date: any;
    public timeStep: number;
    public changeCallback: (date?: Date) => void;
    public timeLabel: string;
    public placeholder: string;
    public fontSize: number;

    public timeCollection: string[];
    public selectedItem: string;
    public selectedIndex: number;
    public _opened: boolean = false;
    private isPm: boolean;

    private

    constructor(
        private $element: JQuery,
        private $mdConstant: any,
        private $document: ng.IDocumentService,
        private $timeout: ng.ITimeoutService,
        public pipMedia: pip.layouts.IMediaService,
        private pipScroll: pip.services.IScrollService,
        private pipTranslate: pip.services.ITranslateService
    ) {
        $element.addClass('iqs-time-autocomplete-panel');

        this.isPm = pipTranslate.language === 'en';
    }

    public $onDestroy(): void {
        this.panelElement.css('display', 'none');
        this._opened = false;
    }

    public $onChanges(changes: TimeAutocompleteChanges): void {
        let change: boolean = false;

        if (changes.date && changes.date.previousValue) {
            if (this.date != changes.date.previousValue) {
                change = true;
            }
        }

        if (changes.timeStep && changes.timeStep.previousValue) {
            if (this.timeStep != changes.timeStep.previousValue) {
                change = true;
            }
        }

        if (change) {
            this.init();
        }
    }

    private init() {
        this.setTimeStep();
        this.initCollection();
        this.initialDate = _.isDate(this.date) ? this.date : _.isDate(Date.parse(this.date)) ? new Date(Date.parse(this.date)) : new Date();

        this.year = this.initialDate.getFullYear();
        this.month = this.initialDate.getMonth();
        this.day = this.initialDate.getDate();
        this.selectedItem = this.date ? this.setTime() : '';
        this.selectedIndex = this.getCurrentIndex();
    }

    public $postLink() {
        this.panelElement = angular.element(this.$element.find('.iqs-time-list-panel')[0]);
        this.panelHTMLElement = this.$element.find('.iqs-time-list-panel')[0];
        this.backdropElement = this.$element.find('.iqs-time-backdrop')[0];

        this.panelElement.css('display', 'none');

        if (this.fontSize && this.fontSize > 0) {
            this.panelElement.css('font-size', this.fontSize + 'px');
        }
    }

    public $onInit() {
        this.placeholder = this.placeholder ? this.placeholder : 'TIME_AUTOCOMPLETE_PLACEHOLDER';
        this.init();
    }

    private setTimeStep(): void {
        if (this.timeStep && _.isNumber(this.timeStep)) {
            let step: number;
            step = Math.round(this.timeStep);
            if (step > 0 && step < TimeAutocompleteOptions.Minutes * TimeAutocompleteOptions.Hours) {
                this.timeStep = step;

                return;
            }
        }

        this.timeStep = TimeAutocompleteOptions.DefaultStep;
    }

    private setTime(): string {
        let hours: number = this.initialDate.getHours();
        let minutes: number = this.initialDate.getMinutes();

        return this.getTimeString(hours, minutes);
    }

    private getTimeString(hours: number, minutes: number): string {
        let h = this.isPm ? hours % 12 : hours;
        let hStr: string = '';
        if (this.isPm) {
            hStr = hours > 11 ? 'PM' : 'AM';
            if (h === 0) h = 12;
        }

        return ("0" + h).substr(-2, 2) + ':' + ("0" + minutes).substr(-2, 2) + ' ' + hStr;
    }

    private initCollection(): void {
        let timeCollection: string[] = [];
        let hours: number = 0;
        let minutes: number = 0;
        let counter: number = 0;

        while (hours < TimeAutocompleteOptions.Hours) {
            timeCollection.push(this.getTimeString(hours, minutes));

            counter = counter + this.timeStep;
            hours = Math.floor(counter / TimeAutocompleteOptions.Minutes);
            minutes = counter % TimeAutocompleteOptions.Minutes;
        }

        this.timeCollection = timeCollection;
    }

    private getNumber(value: string): number {
        let num: number = parseInt(value);

        return isNaN(num) || num < 0 || num > 59 ? 0 : num;
    }
    private verificateTime(timeString: string): string {
        let hours: number;
        let minutes: number;
        let momentObj: moment.Moment;

        if (timeString.length === 0) {
            hours = this.initialDate.getHours();
            minutes = this.initialDate.getMinutes();
        } else {
            if (this.isPm) {
                momentObj = moment(timeString, ["h:mm A"]);
            } else {
                momentObj = moment(timeString, ["h:mm"]);
            }
            if (momentObj.isValid()) {
                hours = momentObj.hour();
                minutes = momentObj.minutes();
            } else {
                hours = this.initialDate.getHours();
                minutes = this.initialDate.getMinutes();
            }
        }

        return this.getTimeString(hours, minutes);
    }

    private getCurrentIndex(): number {
        let hours: number = this.getNumber(this.selectedItem.substr(0, 2));
        let minutes: number = this.getNumber(this.selectedItem.substr(3, 2));
        let hStr: string = '';
        if (this.isPm) {
            hStr = this.selectedItem.substr(6, 2);
            hours = hStr == 'AM' ? hours : hours + 12;
        }

        let index = Math.round((hours * 60 + minutes) / this.timeStep);
        if (index > this.timeCollection.length) {
            index = this.timeCollection.length;
        }

        return index;
    }
    private ElemCoords(obj) {
        var curleft = 0;
        var curtop = 0;
        if (obj.offsetParent) {
            while (1) {
                curleft += obj.offsetLeft;
                curtop += obj.offsetTop;
                if (!obj.offsetParent)
                    break;
                obj = obj.offsetParent;
            }
        }
        else if (obj.x || obj.y) {
            curleft += obj.x;
            curtop += obj.y;
        }
        return { "x": curleft, "y": curtop };
    }

    public onInputFocus($event): void {
        this.opened = true;
        let elementPosition = this.$element.find('#pip-time-input');
        let coords = this.ElemCoords(elementPosition[0]);
        let inputHeight = elementPosition[0].clientHeight;

        document.body.insertBefore(this.panelHTMLElement, document.body.firstChild);
        angular.element(this.panelHTMLElement).css({
            left: coords.x + 'px',
            top: coords.y + inputHeight + 'px',
            width: this.$element[0].clientWidth + 'px'
        });

        document.body.insertBefore(this.backdropElement, document.body.firstChild);
        this.selectedIndex = this.getCurrentIndex();
        this.pipScroll.scrollTo('.iqs-time-list-panel', '#time-list-item-' + this.selectedIndex, 100);
    }

    public onInputBlur(): void {
        this.selectedItem = this.verificateTime(this.selectedItem);
        this.changeTime();
    }

    private selectListItem(): void {
        let item = angular.element(document.body).find('#time-list-item-' + this.selectedIndex);
        let container = angular.element(document.body).find('.iqs-time-list-panel');

        if (this.isScrolled || !item.offset() || !container.scrollTop) return;

        const
            containerTop = container.offset().top,
            containerHeight = container.height(),
            containerBottom = containerTop + containerHeight,
            itemTop = item.offset().top,
            itemHeight = item.outerHeight(true),
            itemBottom = itemTop + itemHeight,
            containerScrollTop = container.scrollTop();

        this.isScrolled = true;
        this.$timeout(() => {
            this.isScrolled = false;
        }, 100);

        if (containerTop > itemTop) {
            container.scrollTop(containerScrollTop + itemTop - containerTop);
        } else if (containerBottom < itemBottom) {
            container.scrollTop(containerScrollTop + itemBottom - containerBottom);
        }
    };

    public onKeyDown(event: KeyboardEvent): void {
        const keyCode = event.which || event.keyCode;
        // Enter pressed
        if (keyCode === 13) {
            if (this.opened) {
                this.selectedItem = this.timeCollection[this.selectedIndex];
                this.changeTime();
                this.opened = false;
            } else {
                this.selectedItem = this.verificateTime(this.selectedItem);
                this.changeTime();
            }
        } else if (keyCode === 27) {
            // ESC pressed
            this.opened = false;
        } else if (keyCode == this.$mdConstant.KEY_CODE.LEFT_ARROW ||
            keyCode == this.$mdConstant.KEY_CODE.UP_ARROW ||
            keyCode == this.$mdConstant.KEY_CODE.RIGHT_ARROW ||
            keyCode == this.$mdConstant.KEY_CODE.DOWN_ARROW
        ) {
            event.preventDefault();

            // open dropdown
            if (keyCode == this.$mdConstant.KEY_CODE.UP_ARROW || keyCode == this.$mdConstant.KEY_CODE.DOWN_ARROW) {
                if (!this.opened) {
                    this.onInputFocus(null);
                    return;
                }
            }

            const increment = (keyCode == this.$mdConstant.KEY_CODE.RIGHT_ARROW || keyCode == this.$mdConstant.KEY_CODE.DOWN_ARROW) ? 1 : -1;
            // Move focus to next control
            if (this.selectedIndex + increment < this.timeCollection.length && this.selectedIndex + increment >= 0) {
                this.selectedIndex += increment;
                this.selectListItem();
            }
        }
    }

    public onChange(): void {
        this.opened = false;
    }

    public selectItem(item: string): void {
        this.selectedItem = item;
        this.changeTime();
        this.opened = false;
    }

    public onBackdropClick($event): void {
        this.opened = false;
    }

    private changeTime(): void {
        let hours: number = this.getNumber(this.selectedItem.substr(0, 2));
        let minutes: number = this.getNumber(this.selectedItem.substr(3, 2));
        let hStr: string = '';
        if (this.isPm) {
            hStr = this.selectedItem.substr(6, 2);
            hours = hStr == 'AM' ? hours : hours + 12;
            if (hours == 12 || hours == 24) {
                hours = hours - 12;
            }
        }


        if (hours === this.initialDate.getHours() && minutes === this.initialDate.getMinutes()) {
            return;
        }

        this.initialDate = new Date(this.year, this.month, this.day, hours, minutes, 0, 0);
        if (this.changeCallback) {
            if (this.date !== undefined) {
                this.date = this.initialDate;
            }

            this.$timeout(() => {
                this.changeCallback(this.initialDate);
            }, 0);

        }
    }

    public set opened(value: boolean) {
        if (this._opened !== value) {
            // close all list
            let lists = angular.element(document.body).find('.iqs-time-list-panel');
            if (lists && lists.length > 0) {
                _.each(lists, (panel) => {
                    angular.element(panel).css('display', 'none');
                    angular.element(this.backdropElement).css('display', 'none');
                });
            }
            if (value) {
                // open this list and backdrop
                this.panelElement.css('display', 'block');
                angular.element(this.backdropElement).css('display', 'block');
            }
            this._opened = value;
        }

    }

    public get opened(): boolean {
        return this._opened;
    }
}

(() => {
    angular.module('pipTimeAutocomplete', [])
        .component('pipTimeAutocomplete', {
            bindings: TimeAutocompleteBindings,
            templateUrl: 'common/components/time-autocomplete/TimeAutocomplete.html',
            controller: TimeAutocompleteController,
            controllerAs: '$ctrl'
        });
})();
