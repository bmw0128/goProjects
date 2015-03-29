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
            console.log("*** saving edited patient: " + JSON.stringify($scope.patient));
            var s = getPatientJSONPOST($scope);
            //var s = JSON.stringify($scope.patient);

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




        /*
        //see if the drug is in deletedInteractions array, if so, delete it, and add it
        //to the selectedDrug
        var isInDeletedInteractionsArray= false;
        var idxOfItem;
        var existingId= '';
        for(var i=0; i < deletedInteractions.length; i++){
            if(deletedInteractions[i].drugName === typeAheadDrugName){
                isInDeletedInteractionsArray= true;
                idxOfItem= i;
                existingId= deletedInteractions[i].id;
                break;
            }
        }
        if(isInDeletedInteractionsArray){
            deletedInteractions.splice(idxOfItem, 1);
        }

        $scope.selectedDrug.interactions.push({'id': '', 'drugName':'','severityLevel':'','summary':''});
        $scope.size= $scope.selectedDrug.interactions.length;
        $scope.selectedDrug.interactions[$scope.size - 1].drugName= typeAheadDrugName;
        $scope.selectedDrug.interactions[$scope.size - 1].id= existingId;
        $scope.selectedDrug.interactions.reverse();
        */
    };





/*
    $scope.diseaseCheckboxClick= function(idx){

        var cbId= '#cb-' + idx;
        var isChecked= $(cbId).is(':checked');

        if(isChecked)
            $(cbId).attr('checked', true);
        else
            $(cbId).attr('checked', false);

        isChecked= $(cbId).is(':checked');
        var diseaseId= '#disease-' + idx;
        var diseaseValueId= $(diseaseId).val();

        if(!isChecked){
            for(var i=0; i < $scope.selectedDiseases.length; i++){
                var disease= $scope.selectedDiseases[i];
                if(diseaseValueId === disease.id){
                    $scope.selectedDiseases.splice(i, 1);
                }
            }
        }else {
            for (var j = 0; j < $scope.diseases.length; j++) {
                var dis= $scope.diseases[j];
                if(dis.id === diseaseValueId){
                    $scope.selectedDiseases.push(dis);
                }
            }
        }

    };
*/

    $scope.delete = function () {

        Restangular.one('patients/' + $scope.patient.id + "/").remove().then(
            function () {
                $location.path('/patients');
            });
    };

    /*
    $scope.searchField= function(){

        for (var i = 0; i < $scope.selectedDiseases.length; i++) {
            var outerDiseaseId = $scope.selectedDiseases[i].id;
            //console.log("*** sf outerDiseaseId: " + outerDiseaseId);
            var diseasesCopy= [];
            for (var j = 0; j < $scope.diseases.length; j++) {
                diseasesCopy.push($scope.diseases[j]);
                //var diseaseId = "disease-" + j;
                var diseaseElem= '#disease-' + j;
                var diseaseIdValue = $(diseaseElem).val();
                if (outerDiseaseId === diseaseIdValue) {
                    //var cbId = "cb-" + j;
                    //document.getElementById(cbId).checked = true;
                    var cbId= '#cb-' + j;
                    $(cbId).attr('checked', true);
                    break;
                }
            }
        }
        if($('#searchField').val() === ''){
            console.log("*** doing empty...");
            var diseasesCopy= [];
            for (var j = 0; j < $scope.diseases.length; j++) {
                diseasesCopy.push($scope.diseases[j]);
            }
            $scope.diseases= diseasesCopy;
        }
    };
    */

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
            /*
            for (var i = 0; i < $scope.patient.diseases.length; i++) {
                var outerDiseaseId = $scope.patient.diseases[i];
                for (var j = 0; j < $scope.diseases.length; j++) {
                    var diseaseId = "disease-" + j;
                    var diseaseIdValue = document.getElementById(diseaseId).value;
                    if (outerDiseaseId === diseaseIdValue) {
                        $scope.selectedDiseases.push($scope.diseases[j]);
                        var cbId = "cb-" + j;
                        document.getElementById(cbId).checked = true;
                        break;
                    }
                }
            }
            $scope.doPageLoad= false;
            */
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
}

function getSelectedDiseases($scope){
    /*
    var objs= [];
    var size= $scope.diseases.length;
    for(var i=0; i < size; i++){
        var diseaseId= "disease-" + i;
        var cbId= "cb-" + i;
        if(document.getElementById(cbId).checked){
            var diseaseIdVal= document.getElementById(diseaseId).value;
            objs.push(diseaseIdVal);
        }
    }
    return objs;
    */
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

