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
    };

    $scope.hasValidationErrors= false;

    $scope.clearValidationErrors= function(){
        $scope.hasValidationErrors= false;
    };

    $scope.save= function(){

        $scope.hasValidationErrors= false;
        if(!validationPassed($scope)){
            $scope.hasValidationErrors= true;
        }

        if(!$scope.hasValidationErrors){
            var s = getPatientJSONPOST($scope);
            //console.log("*** patient: " + JSON.stringify(s));
            Restangular.all('patients/new').post(s).then(
                function() {
                    $location.path('/patients');
                });
        }

    };

    $scope.selectedSection= "Patient Info Sections";
    $scope.navSection= true;
    $scope.generalSection= false;
    $scope.bloodChemistrySection= false;
    $scope.diseasesSection= false;

    $scope.patientSection= function(section){
        if(section === 'nav'){
            $scope.selectedSection= "Patient Info Sections";
            $scope.navSection= true;
            $scope.generalSection= false;
            $scope.bloodChemistrySection= false;
            $scope.diseasesSection= false;
        }
        if(section === 'general'){
            $scope.selectedSection= "Selected Section: General...click to go back";
            $scope.navSection= false;
            $scope.generalSection= true;
            $scope.bloodChemistrySection= false;
            $scope.diseasesSection= false;
        }
        if(section === 'bloodChemistry'){
            $scope.selectedSection= "Selected Section: Blood Chemistry...click to go back";
            $scope.navSection= false;
            $scope.generalSection= false;
            $scope.bloodChemistrySection= true;
            $scope.diseasesSection= false;
        }
        if(section === 'diseases'){
            $scope.selectedSection= "Selected Section: Diseases...click to go back";
            $scope.navSection= false;
            $scope.generalSection= false;
            $scope.bloodChemistrySection= false;
            $scope.diseasesSection= true;
        }

    }
}

function validationPassed($scope){

    var age= $('#age').val();
    var heartRate= $('#heartRate').val();
    var lastName= $('#lastName').val();

    return lastName != ''
                && /^[1-9]*$/.test(age)
                && /^[1-9]*$/.test(heartRate)
                && pregnancyValidationOk($scope);

}

function pregnancyValidationOk($scope){

    var gender= $('#gender').val();
    var pregnant= $('#pregnant').val();

    if(gender === 'male' && pregnant === 'true'){
        return false;
    }
    return true;

}

function getPatientJSONPOST($scope) {

    var diseaseArray= [];
    angular.forEach($scope.diseases, function(value, key) {
        if(value.ticked === true) {
            diseaseArray.push(value.id);
        }
    });
    /*
    var age = document.getElementById("age").value;
    var gender = document.getElementById("gender").value;
    var pregnant = document.getElementById("pregnant").value;
    var race = document.getElementById("race").value;
    */

    var firstName= $('#firstName').val();
    var lastName= $('#lastName').val();
    var age= $('#age').val();
    var gender= $('#gender').val();
    var pregnant= $('#pregnant').val();
    var race= $('#race').val();
    var bp= $('#bp').val();
    var heartRate= $('#heartRate').val();

    return {"firstName": firstName,
            "lastName": lastName,
            "age": parseInt(age),
            "gender": gender,
            "pregnant": pregnant,
            "race": race,
            "bp": bp,
            "heartRate": parseInt(heartRate),
            "diseases": diseaseArray};
}

