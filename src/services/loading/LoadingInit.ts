function initPopulating(
    iqsStatesViewModel: iqs.shell.IStatesViewModel,
    iqsIncidentsViewModel: iqs.shell.IIncidentsViewModel,
    iqsMapViewModel: iqs.shell.IMapViewModel,
    iqsMapConfig: iqs.shell.IMapService,
    pipIdentity: pip.services.IIdentityService,
    iqsLoading: iqs.shell.ILoadingService,
    iqsOrganization: iqs.shell.IOrganizationService
) {
    iqsLoading.push('data', [
        iqsStatesViewModel.clean.bind(iqsStatesViewModel),
        iqsMapConfig.clean.bind(iqsMapConfig)
    ], async.parallel, [
            (callback) => {
                iqsStatesViewModel.cleanUpAllStates();
                iqsStatesViewModel.initStates(new Date().toISOString(), 'all', 
                    (data: any) => {
                        callback();
                    },
                    (error: any) => {
                        callback(error);
                    });
            },
            (callback) => {
                iqsMapConfig.orgId = iqsOrganization.orgId;
                iqsMapViewModel.initMap(
                    () => {
                        callback();
                    },
                    (error: any) => {
                        callback();
                    });
            },
            (callback) => {
                iqsIncidentsViewModel.readIncidentsCount(
                    () => {
                        callback();
                    }
                );
            }
        ]);
    if (pipIdentity.identity && pipIdentity.identity.id) {
        iqsLoading.start();
    }
}


let m: any;
const requires = [
    'iqsIncidents.ViewModel',
    'iqsMap.ViewModel',
    'iqsMapConfig',
    'iqsOrganizations.Service',
];

try {
    m = angular.module('iqsLoading');
    m.requires.push(...requires);
    m.run(initPopulating);
} catch (err) { }