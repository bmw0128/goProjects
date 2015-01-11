app.config(function($routeProvider, RestangularProvider) {
    !$routeProvider.

        when('/patients', {
            controller: PatientsCtrl,
            templateUrl: 'frontend/partials/patient/patient-list.html'

        }).

        when('/patients/new', {
            controller: PatientNewCtrl,
            templateUrl: 'frontend/partials/patient/patient-new.html'

        });
});

function PatientsCtrl($scope, Restangular) {

    Restangular.all('patients').getList().then(
        function(patients) {
            $scope.patients = patients;
        });
}

function PatientNewCtrl($scope, Restangular, $location, $http, $q) {

    Restangular.all('diseases').getList().then(
        function(diseases) {
            $scope.diseases = diseases;
        });


    $scope.cancel= function(){
        $location.path('/patients');
    }

    $scope.save= function(){

        var s = getPatientJSONPOST($scope);

        //console.log("*** s: " + JSON.stringify(s));

        Restangular.all('patients/new').post(s).then(
            function() {
                $location.path('/patients');
            });

    };

    $scope.selectedSection= "Patient Info Sections";
    $scope.navSection= true;
    $scope.generalSection= false;
    $scope.diseasesSection= false;

    $scope.patientSection= function(section){
        if(section === 'nav'){
            $scope.selectedSection= "Patient Info Sections";
            $scope.navSection= true;
            $scope.generalSection= false;
            $scope.diseasesSection= false;
        }
        if(section === 'general'){
            $scope.selectedSection= "Selected Section: General...click to go back";
            $scope.navSection= false;
            $scope.generalSection= true;
            $scope.diseasesSection= false;
        }
        if(section === 'diseases'){
            $scope.selectedSection= "Selected Section: Diseases...click to go back";
            $scope.navSection= false;
            $scope.generalSection= false;
            $scope.diseasesSection= true;
        }

    }
}

function getPatientJSONPOST($scope) {

    var diseaseArray= [];
    angular.forEach($scope.diseases, function(value, key) {
        if(value.ticked === true) {
            diseaseArray.push(value.id);
        }
    });

    var age = document.getElementById("age").value;
    var gender = document.getElementById("gender").value;
    var pregnant = document.getElementById("pregnant").value;
    var race = document.getElementById("race").value;

    return {"age": parseInt(age),
            "gender": gender,
            "pregnant": pregnant,
            "race": race,
            "diseases": diseaseArray};
}

