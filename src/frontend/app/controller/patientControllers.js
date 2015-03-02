app.config(function($routeProvider, RestangularProvider) {
    !$routeProvider.

        when('/patients', {
            controller: PatientsCtrl,
            templateUrl: 'frontend/partials/patient/patient-list.html'

        }).

        when('/patients/edit/:id',{
            controller:PatientEditCtrl,
            templateUrl: 'frontend/partials/patient/patient-new.html',
            resolve: {
                patient: function(Restangular, $route){
                    var theRoute= 'patients/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        }).

        when('/patients/new', {
            controller: PatientNewCtrl,
            templateUrl: 'frontend/partials/patient/patient-new.html'

        });
});

function PatientEditCtrl($scope, $location, Restangular, patient) {

    Restangular.all('diseases').getList().then(
        function(diseases) {
            $scope.diseases = diseases;
        });

    $scope.patient = patient;
    console.log("*** Patient stringify: " + JSON.stringify($scope.patient));

    setUpSections($scope);

    /*
    var originalPatientName = $scope.selectedPatient.patientName;

    var allExistingPatientGroupNames = [];
    Restangular.all('patientGroups').getList().then(
        function (patientGroups) {
            $scope.patientGroups = patientGroups;

            for (var i = 0; i < $scope.patientGroups.length; i++) {
                allExistingPatientGroupNames.push($scope.patientGroups[i].patientGroupName.toLowerCase());
            }

            //take out patientGroup name from 'allExistingPatientGroupNames'
            var idx = allExistingPatientGroupNames.indexOf(originalPatientGroupName);
            allExistingPatientGroupNames.splice(idx, 1);

        });

    $scope.cancel = function () {
        $location.path('/admin/patientGroupManagement');
    };

    $scope.isDuplicatePatientGroupName = false;

    $scope.resetDuplicatePatientGroupName = function () {
        $scope.isDuplicatePatientGroupName = false;
        $scope.selectedPatientGroup.patientGroupName = originalPatientGroupName;
    };

    $scope.hasRangeError= false;
    $scope.hasNumberInputError= false;

    $scope.save = function () {

        if(originalPatientGroupName != $scope.selectedPatientGroup.patientGroupName) {

            for(var i=0; i < allExistingPatientGroupNames.length; i++){
                if($scope.selectedPatientGroup.patientGroupName.toLowerCase() === allExistingPatientGroupNames[i].toLowerCase()){
                    $scope.isDuplicatePatientGroupName= true;
                    break;
                }
            }
        }

        $scope.hasRangeError= false;
        $scope.hasNumberInputError= false;

        if(!rangeCheckOk($scope)){
            $scope.hasRangeError= true;
        }
        if(!inputNumberCheckOk($scope)){
            $scope.hasNumberInputError= true;
        }
        if(!$scope.hasRangeError && !$scope.hasNumberInputError && !$scope.isDuplicatePatientGroupName) {

            var s = getEditPatientGroupJSONPOST($scope);
            console.log("*** PG Edit POST: " + JSON.stringify(s));

            Restangular.all('patientGroups/edit').post(s).then(
                function() {
                    $location.path('/admin/patientGroupManagement');
                });

        }

    };

    $scope.delete = function () {

        Restangular.one('patientGroups/' + $scope.selectedPatientGroup.id + "/").remove().then(
            function () {
                $location.path('/admin/patientGroupManagement');
            });
    };

    */
    $scope.pageLoaded = function () {
        for (var i = 0; i < $scope.patient.diseases.length; i++) {
            var outerDiseaseId = $scope.patient.diseases[i];
            for (var j = 0; j < $scope.diseases.length; j++) {
                var diseaseId = "disease-" + j;
                var diseaseIdValue = document.getElementById(diseaseId).value;
                if (outerDiseaseId === diseaseIdValue) {
                    var cbId = "cb-" + j;
                    //var inId = "#in-" + j;
                    //var selId = "#sel-" + j;
                    document.getElementById(cbId).checked = true;
                    //$(selId).val($scope.selectedPatientGroup.assessmentValues[i].operator);
                    //$(inId).val($scope.selectedPatientGroup.assessmentValues[i].value);
                    break;
                }
            }
        }
        return false;
    };

}

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

    setUpSections($scope);
    /*
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
    */
}

function getSelectedDiseases($scope){
    var objs= [];
    var size= $scope.diseases.length;
    for(var i=0; i < size; i++){
        var diseaseId= "disease-" + i;
        var cbId= "cb-" + i;
        //var selId= "sel-" + i;
        //var inId= "in-" + i;
        if(document.getElementById(cbId).checked){
            var diseaseIdVal= document.getElementById(diseaseId).value;
            //var operatorVal= document.getElementById(selId).value;
            //var inVal= document.getElementById(inId).value;
            /*
            var assessment= {
                assessmentId: assessmentIdVal,
                operator: operatorVal,
                value: inVal
            };
            objs.push(assessment);
            */
            objs.push(diseaseIdVal);
        }
    }
    return objs;
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

    /*
    var diseaseArray= [];
    angular.forEach($scope.diseases, function(value, key) {
        if(value.ticked === true) {
            diseaseArray.push(value.id);
        }
    });
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
            //"diseases": diseaseArray};
            "diseases": getSelectedDiseases($scope)};
}

function setUpSections($scope){

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

