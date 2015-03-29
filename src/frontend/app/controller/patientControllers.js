app.config(function($routeProvider, RestangularProvider) {
    !$routeProvider.

        when('/patients', {
            controller: PatientsCtrl,
            templateUrl: 'frontend/partials/patient/patient-list.html'

        }).

        when('/patients/edit/:id',{
            controller:PatientEditCtrl,
            templateUrl: 'frontend/partials/patient/patient.html',
            resolve: {
                patient: function(Restangular, $route){
                    var theRoute= 'patients/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        }).

        when('/patients/new', {
            controller: PatientNewCtrl,
            templateUrl: 'frontend/partials/patient/patient.html'

        });
});

function PatientEditCtrl($scope, $location, Restangular, patient) {

    $scope.patient = patient;
    //console.log("*** Patient stringify: " + JSON.stringify($scope.patient));

    setUpSections($scope);

    Restangular.all('diseases').getList().then(
        function(diseases) {
            $scope.diseases = diseases;
        });


    $scope.cancel = function () {
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
            //console.log("*** saving edited patient: " + JSON.stringify($scope.patient));
            var s = getPatientJSONPOST($scope);

            Restangular.all('patients/edit').post(s).then(
                function() {
                    $location.path('/patients');
                });
        }

    };

    $scope.addDisease= function(obj){

        $scope.modeldisplay= '';
        $scope.showNewInteractionDrug= true;
        var typeAheadDrugName= obj.target.attributes.data.value;

        //console.log("*** addDisease name: %s", typeAheadDrugName);

        if($scope.patient.diseases == null){
            $scope.patient.diseases= [];
        }

        for (var j = 0; j < $scope.diseases.length; j++) {
            var diseaseName = $scope.diseases[j].diseaseName;
            if (typeAheadDrugName.trim() === diseaseName) {
                //console.log("*** adding disease from typeahead: %s", JSON.stringify($scope.diseases[j]));
                $scope.patient.diseases.push($scope.diseases[j]);
                break;
            }
        }

    };

    $scope.delete = function () {

        Restangular.one('patients/' + $scope.patient.id + "/").remove().then(
            function () {
                $location.path('/patients');
            });
    };

    $scope.removeDisease= function(id){

        for(var i=0; i < $scope.patient.diseases.length; i++){
            var diseaseId= $scope.patient.diseases[i].id;
            if(id === diseaseId) {
                $scope.patient.diseases.splice(i, 1);
                break;
            }
        }
    };

    $scope.doPageLoad= true;

    $scope.pageLoaded = function () {
        if($scope.doPageLoad) {
            var diseaseOjects= [];
            for (var i = 0; i < $scope.patient.diseases.length; i++) {
                var outerDiseaseId = $scope.patient.diseases[i];
                for (var j = 0; j < $scope.diseases.length; j++) {
                    var diseaseIdValue = $scope.diseases[j].id;
                    if (outerDiseaseId === diseaseIdValue) {
                        //console.log("*** adding disease: %s", JSON.stringify($scope.diseases[j]));
                        diseaseOjects.push($scope.diseases[j]);
                        break;
                    }
                }
            }
            $scope.patient.diseases= diseaseOjects;
            $scope.doPageLoad= false;
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

    var patient=
        {id:null,
        firstName: null,
        lastName: null,
        age: null,
        gender: null,
        pregnant: null,
        race: null,
        bp: null,
        heartRate: null,
        diseases: []};

    $scope.patient= patient;

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

    $scope.addDisease= function(obj){

        $scope.modeldisplay= '';
        $scope.showNewInteractionDrug= true;
        var typeAheadDrugName= obj.target.attributes.data.value;

        //console.log("*** addDisease name: %s", typeAheadDrugName);

        if($scope.patient.diseases == null){
            $scope.patient.diseases= [];
        }

        for (var j = 0; j < $scope.diseases.length; j++) {
            var diseaseName = $scope.diseases[j].diseaseName;
            if (typeAheadDrugName.trim() === diseaseName) {
                //console.log("*** adding disease from typeahead: %s", JSON.stringify($scope.diseases[j]));
                $scope.patient.diseases.push($scope.diseases[j]);
                break;
            }
        }
    };
}

function getSelectedDiseases($scope){

    var objs= [];
    for(var i=0; i < $scope.patient.diseases.length; i++){
      objs.push($scope.patient.diseases[i].id);
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

    var firstName= $('#firstName').val();
    var lastName= $('#lastName').val();
    var age= $('#age').val();
    var gender= $('#gender').val();
    var pregnant= $('#pregnant').val();
    var race= $('#race').val();
    var bp= $('#bp').val();
    var heartRate= $('#heartRate').val();

    return {"id":$scope.patient.id,
            "firstName": firstName,
            "lastName": lastName,
            "age": parseInt(age),
            "gender": gender,
            "pregnant": pregnant,
            "race": race,
            "bp": bp,
            "heartRate": parseInt(heartRate),
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

