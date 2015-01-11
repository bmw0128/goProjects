app.config(function($routeProvider, RestangularProvider) {
    !$routeProvider.

        when('/admin/patientGroupManagement', {
            controller: PatientGroupsCtrl,
            templateUrl: 'frontend/partials/admin/patientGroup-list.html'

        }).

        when('/admin/patientGroup/new', {
            controller: PatientGroupNewCtrl,
            templateUrl: 'frontend/partials/admin/patientGroup-new.html'

        });
});

function PatientGroupsCtrl($scope, Restangular) {

    /*
    Restangular.all('patientGroups').getList().then(
        function(patientGroups) {
            $scope.patientGroups = patientGroups;
        });
    */
};

function PatientGroupNewCtrl($scope, Restangular, $location, $http, $q) {



};