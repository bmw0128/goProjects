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

    Restangular.all('patientGroups').getList().then(
        function(patientGroups) {
            $scope.patientGroups = patientGroups;
        });

};

function PatientGroupNewCtrl($scope, Restangular, $location, $http, $q) {

    Restangular.all('assessments').getList().then(
        function(assessments) {
            $scope.assessments = assessments;
            //console.log(JSON.stringify($scope.diseases));
        });

    var allExistingPatientGroupNames= [];
    Restangular.all('patientGroups').getList().then(
        function(patientGroups) {
            $scope.patientGroups = patientGroups;

            for(var i=0; i < $scope.patientGroups.length; i++){
                allExistingPatientGroupNames.push($scope.patientGroups[i].patientGroupName.toLowerCase());
            }
        });

    $scope.isDuplicatePatientGroupName= false;

    $scope.resetDuplicatePatientGroupName= function(){
        $scope.isDuplicatePatientGroupName= false;
    };

    $scope.checkDuplicatePatientGroupName= function(patientGroupName){

        if(allExistingPatientGroupNames.indexOf(patientGroupName.toLowerCase()) > -1)
            $scope.isDuplicatePatientGroupName= true;
    };



    $scope.cancel= function(){
        $location.path('/admin/patientGroupManagement');
    };

};