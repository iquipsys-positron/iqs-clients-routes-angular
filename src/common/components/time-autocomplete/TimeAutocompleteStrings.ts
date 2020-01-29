
{
    function declareTimeAutocompleteResources(pipTranslateProvider: pip.services.ITranslateProvider) {
        pipTranslateProvider.translations('en', {
            TIME_AUTOCOMPLETE_PLACEHOLDER: 'Time',

        });
        pipTranslateProvider.translations('ru', {
            TIME_AUTOCOMPLETE_PLACEHOLDER: 'Время',
        });
    }

    angular
        .module('pipTimeAutocomplete')
        .config(declareTimeAutocompleteResources);
}
