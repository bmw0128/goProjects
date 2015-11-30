app.config(function($routeProvider, RestangularProvider) {

    !$routeProvider.

        when('/admin/diseaseManagement', {
            controller: DiseaseListCtrl,
            templateUrl: 'frontend/partials/admin/disease-list.html'
        }).

        when('/admin/diseaseManagement/new', {
            controller: DiseaseNewCtrl,
            templateUrl: 'frontend/partials/admin/disease-new.html'
        }).

        when('/admin/diseaseManagement/edit/:id',{
            controller:DiseaseEditCtrl,
            templateUrl: 'frontend/partials/admin/disease-edit.html',
            resolve: {
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        }).

        when('/admin/diseaseManagement/patientGroupings/:id',{
            controller:PatientGroupingsCtrl,
            templateUrl: 'frontend/partials/admin/disease-patientGroupings.html',
            resolve: {
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                },
                patientGroupings: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.id + '/patientGroupings';
                    return Restangular.one(theRoute).get();
                }
            }
        }).

        when('/admin/diseaseManagement/disease/:diseaseId/patientGroupCombos/new/',{
            controller:DiseaseNewPatientGroupCombosCtrl,
            templateUrl: 'frontend/partials/admin/disease-newPatientGroupCombo.html',
            resolve: {
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        }).

        when('/admin/diseaseManagement/disease/:diseaseId/patientGroupingCombo/edit/:pgId',{
            controller:DiseaseEditPatientGroupingComboCtrl,
            templateUrl: 'frontend/partials/admin/disease-editPatientGroupCombo.html',
            resolve: {
                patientGroupingCombo: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/patientGroupingCombo/' + $route.current.params.pgId + '/';
                    return Restangular.one(theRoute).get();
                },
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/';
                    return Restangular.one(theRoute).get();
                }
            }

        }).

        when('/admin/diseaseManagement/disease/:diseaseId/patientGroupingCombo/:pgId/tx/new',{
            controller:DiseasePatientGroupingComboNewTxCtrl,
            templateUrl: 'frontend/partials/admin/disease-patientGroupingCombo-txLine.html',
            resolve: {
                patientGroupingCombo: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/patientGroupingCombo/' + $route.current.params.pgId + '/';
                    return Restangular.one(theRoute).get();
                },
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/';
                    return Restangular.one(theRoute).get();
                }
            }

        }).

        when('/admin/diseaseManagement/disease/:diseaseId/patientGroupingCombo/:pgId/tx/list',{
            controller:DiseasePGComboTxListCtrl,
            templateUrl: 'frontend/partials/admin/disease-pgCombo-txLineList.html',
            resolve: {
                /*
                patientGroupingCombo: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/patientGroupingCombo/' + $route.current.params.pgId + '/';
                    return Restangular.one(theRoute).get();
                },
                */
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        }).

        when('/admin/diseaseManagement/detail/:id',{
            controller:DiseaseDetailCtrl,
            templateUrl: 'frontend/partials/admin/disease-detail.html',
            resolve: {
                disease: function(Restangular, $route){
                    var theRoute= 'drugs/withinteractions/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        })
});

function DiseasePGComboTxListCtrl($scope, $location, Restangular, disease, $route){

    //console.log("*** route pgId: " + $route.current.params.pgId);
    $scope.disease = disease;
    //$scope.patientGroupingCombo= patientGroupingCombo;

    $scope.cancel= function(){
        $location.path('/admin/diseaseManagement/patientGroupings/' + $scope.disease.id);
    };
}


function DiseasePatientGroupingComboNewTxCtrl($scope, $location, Restangular, patientGroupingCombo, disease){

    $scope.disease = disease;
    $scope.patientGroupingCombo= patientGroupingCombo;

    //load the drugs here
    Restangular.all('drugs').getList().then(
        function(drugs) {
            $scope.drugsPrimaryGroupA= drugs;
            $scope.drugsPrimaryGroupB= drugs;
            $scope.drugsPrimaryGroupC= drugs;

            $scope.drugsSecondaryGroupA= drugs;
            $scope.drugsSecondaryGroupB= drugs;
            $scope.drugsSecondaryGroupC= drugs;

            $scope.drugsTertiaryGroupA= drugs;
            $scope.drugsTertiaryGroupB= drugs;
            $scope.drugsTertiaryGroupC= drugs;
        });


    /*
    $scope.txLine= {
        id: null,
        number: null,
        name: ""
    };
    */

    setUpTxOptionSections($scope);

    $scope.cancel= function(){
        $location.path('/admin/diseaseManagement/patientGroupings/' + $scope.disease.id);
    };

    //Primary Drugs
    $scope.addDrugPrimaryGroupA= function(obj){

        $scope.modeldisplayA= '';
        var typeAheadDrugNameGroupA= obj.target.attributes.data.value;
        if($scope.selectedDrugsPrimaryGroupA == null)
            $scope.selectedDrugsPrimaryGroupA= [];

        var idx= $scope.selectedDrugsPrimaryGroupA.indexOf(typeAheadDrugNameGroupA);
        if(idx === -1)
            $scope.selectedDrugsPrimaryGroupA.push(typeAheadDrugNameGroupA);
    };

    $scope.removeDrugPrimaryGroupA= function(drugNameGroupA){

        var idx= $scope.selectedDrugsPrimaryGroupA.indexOf(drugNameGroupA);
        if(idx > -1)
            $scope.selectedDrugsPrimaryGroupA.splice(idx, 1);
    };

    $scope.addDrugPrimaryGroupB= function(obj){
        $scope.modeldisplayB= '';
        var typeAheadDrugNameGroupB= obj.target.attributes.data.value;
        if($scope.selectedDrugsPrimaryGroupB == null)
            $scope.selectedDrugsPrimaryGroupB= [];

        var idx= $scope.selectedDrugsPrimaryGroupB.indexOf(typeAheadDrugNameGroupB);
        if(idx === -1)
            $scope.selectedDrugsPrimaryGroupB.push(typeAheadDrugNameGroupB);
    };

    $scope.removeDrugPrimaryGroupB= function(drugNameGroupB){

        var idx= $scope.selectedDrugsPrimaryGroupB.indexOf(drugNameGroupB);
        if(idx > -1)
            $scope.selectedDrugsPrimaryGroupB.splice(idx, 1);
    };

    $scope.addDrugPrimaryGroupC= function(obj){
        $scope.modeldisplayC= '';
        var typeAheadDrugNameGroupC= obj.target.attributes.data.value;
        if($scope.selectedDrugsPrimaryGroupC == null)
            $scope.selectedDrugsPrimaryGroupC= [];

        var idx= $scope.selectedDrugsPrimaryGroupC.indexOf(typeAheadDrugNameGroupC);
        if(idx === -1)
            $scope.selectedDrugsPrimaryGroupC.push(typeAheadDrugNameGroupC);
    };

    $scope.removeDrugPrimaryGroupC= function(drugNameGroupC){

        var idx= $scope.selectedDrugsPrimaryGroupC.indexOf(drugNameGroupC);
        if(idx > -1)
            $scope.selectedDrugsPrimaryGroupC.splice(idx, 1);
    };
    //end Primary Drugs

    //Secondary Drugs
    $scope.addDrugSecondaryGroupA= function(obj){

        $scope.modeldisplaySecA= '';
        var typeAheadDrugNameGroupA= obj.target.attributes.data.value;
        if($scope.selectedDrugsSecondaryGroupA == null)
            $scope.selectedDrugsSecondaryGroupA= [];

        var idx= $scope.selectedDrugsSecondaryGroupA.indexOf(typeAheadDrugNameGroupA);
        if(idx === -1)
            $scope.selectedDrugsSecondaryGroupA.push(typeAheadDrugNameGroupA);
    };

    $scope.removeDrugSecondaryGroupA= function(drugNameGroupA){

        var idx= $scope.selectedDrugsSecondaryGroupA.indexOf(drugNameGroupA);
        if(idx > -1)
            $scope.selectedDrugsSecondaryGroupA.splice(idx, 1);
    };

    $scope.addDrugSecondaryGroupB= function(obj){

        $scope.modeldisplaySecB= '';
        var typeAheadDrugNameGroupA= obj.target.attributes.data.value;
        if($scope.selectedDrugsSecondaryGroupB == null)
            $scope.selectedDrugsSecondaryGroupB= [];

        var idx= $scope.selectedDrugsSecondaryGroupB.indexOf(typeAheadDrugNameGroupA);
        if(idx === -1)
            $scope.selectedDrugsSecondaryGroupB.push(typeAheadDrugNameGroupA);
    };

    $scope.removeDrugSecondaryGroupB= function(drugNameGroupA){

        var idx= $scope.selectedDrugsSecondaryGroupB.indexOf(drugNameGroupA);
        if(idx > -1)
            $scope.selectedDrugsSecondaryGroupB.splice(idx, 1);
    };

    $scope.addDrugSecondaryGroupC= function(obj){

        $scope.modeldisplaySecC= '';
        var typeAheadDrugNameGroupA= obj.target.attributes.data.value;
        if($scope.selectedDrugsSecondaryGroupC == null)
            $scope.selectedDrugsSecondaryGroupC= [];

        var idx= $scope.selectedDrugsSecondaryGroupC.indexOf(typeAheadDrugNameGroupA);
        if(idx === -1)
            $scope.selectedDrugsSecondaryGroupC.push(typeAheadDrugNameGroupA);
    };

    $scope.removeDrugSecondaryGroupC= function(drugNameGroupA){

        var idx= $scope.selectedDrugsSecondaryGroupC.indexOf(drugNameGroupA);
        if(idx > -1)
            $scope.selectedDrugsSecondaryGroupC.splice(idx, 1);
    };
    //end Secondary Drugs

    //Tertiary Drugs
    $scope.addDrugTertiaryGroupA= function(obj){

        $scope.modeldisplayTerA= '';
        var typeAheadDrugNameGroupA= obj.target.attributes.data.value;
        if($scope.selectedDrugsTertiaryGroupA == null)
            $scope.selectedDrugsTertiaryGroupA= [];

        var idx= $scope.selectedDrugsTertiaryGroupA.indexOf(typeAheadDrugNameGroupA);
        if(idx === -1)
            $scope.selectedDrugsTertiaryGroupA.push(typeAheadDrugNameGroupA);
    };

    $scope.removeDrugTertiaryGroupA= function(drugNameGroupA){

        var idx= $scope.selectedDrugsTertiaryGroupA.indexOf(drugNameGroupA);
        if(idx > -1)
            $scope.selectedDrugsTertiaryGroupA.splice(idx, 1);
    };

    $scope.addDrugTertiaryGroupB= function(obj){
        $scope.modeldisplayTerB= '';
        var typeAheadDrugNameGroupB= obj.target.attributes.data.value;
        if($scope.selectedDrugsTertiaryGroupB == null)
            $scope.selectedDrugsTertiaryGroupB= [];

        var idx= $scope.selectedDrugsTertiaryGroupB.indexOf(typeAheadDrugNameGroupB);
        if(idx === -1)
            $scope.selectedDrugsTertiaryGroupB.push(typeAheadDrugNameGroupB);
    };

    $scope.removeDrugTertiaryGroupB= function(drugNameGroupB){

        var idx= $scope.selectedDrugsTertiaryGroupB.indexOf(drugNameGroupB);
        if(idx > -1)
            $scope.selectedDrugsTertiaryGroupB.splice(idx, 1);
    };

    $scope.addDrugTertiaryGroupC= function(obj){
        $scope.modeldisplayTerC= '';
        var typeAheadDrugNameGroupC= obj.target.attributes.data.value;
        if($scope.selectedDrugsTertiaryGroupC == null)
            $scope.selectedDrugsTertiaryGroupC= [];

        var idx= $scope.selectedDrugsTertiaryGroupC.indexOf(typeAheadDrugNameGroupC);
        if(idx === -1)
            $scope.selectedDrugsTertiaryGroupC.push(typeAheadDrugNameGroupC);
    };

    $scope.removeDrugTertiaryGroupC= function(drugNameGroupC){

        var idx= $scope.selectedDrugsTertiaryGroupC.indexOf(drugNameGroupC);
        if(idx > -1)
            $scope.selectedDrugsTertiaryGroupC.splice(idx, 1);
    };
    //end Tertiary Drugs

    $scope.save= function(){

        /*
        console.log("SAVE()...$scope.txLine: " + JSON.stringify($scope.txLine));
        console.log("*** diseaseId: " + $scope.disease.id);
        console.log("*** patientGroupingCombo: " + $scope.patientGroupingCombo.id);
        console.log("*** pga: " + $scope.selectedDrugsPrimaryGroupA);
        */

        /*
        if($scope.selectedDrugsPrimaryGroupA != null){
            for(var i=0; i < $scope.selectedDrugsPrimaryGroupA.length; i++){
                var drugName= $scope.selectedDrugsPrimaryGroupA[i];
                console.log("*** a: " + drugName);
                var id= "dosagePrimaryGroupA-" + drugName;
                var dosage= document.getElementById(id).value;
                console.log("*** a -- dosage: " + dosage);
            }
        }
        if($scope.selectedDrugsPrimaryGroupB != null) {
            for (var i = 0; i < $scope.selectedDrugsPrimaryGroupB.length; i++) {
                console.log("*** b: " + $scope.selectedDrugsPrimaryGroupB[i]);
            }
        }
        if($scope.selectedDrugsPrimaryGroupC != null) {
            for (var i = 0; i < $scope.selectedDrugsPrimaryGroupC.length; i++) {
                console.log("*** c: " + $scope.selectedDrugsPrimaryGroupC[i]);
            }
        }

        if($scope.selectedDrugsSecondaryGroupA != null) {
            for (var i = 0; i < $scope.selectedDrugsSecondaryGroupA.length; i++) {
                console.log("*** d: " + $scope.selectedDrugsSecondaryGroupA[i]);
            }
        }
        if($scope.selectedDrugsSecondaryGroupB != null) {
            for (var i = 0; i < $scope.selectedDrugsSecondaryGroupB.length; i++) {
                console.log("*** e: " + $scope.selectedDrugsSecondaryGroupB[i]);
            }
        }
        if($scope.selectedDrugsSecondaryGroupC != null) {
            for (var i = 0; i < $scope.selectedDrugsSecondaryGroupC.length; i++) {
                console.log("*** f: " + $scope.selectedDrugsSecondaryGroupC[i]);
            }
        }

        if($scope.selectedDrugsTertiaryGroupA != null) {
            for (var i = 0; i < $scope.selectedDrugsTertiaryGroupA.length; i++) {
                console.log("*** g: " + $scope.selectedDrugsTertiaryGroupA[i]);
            }
        }
        if($scope.selectedDrugsTertiaryGroupB != null) {
            for (var i = 0; i < $scope.selectedDrugsTertiaryGroupB.length; i++) {
                console.log("*** h: " + $scope.selectedDrugsTertiaryGroupB[i]);
            }
        }
        if($scope.selectedDrugsTertiaryGroupC != null) {
            for (var i = 0; i < $scope.selectedDrugsTertiaryGroupC.length; i++) {
                console.log("*** i: " + $scope.selectedDrugsTertiaryGroupC[i]);
            }
        }
        */
        //var s= $scope.txLine;
        var s= getJSONTxLine($scope);

        Restangular.all('txline/patientGroupingCombo/' + $scope.patientGroupingCombo.id + "/").post(s).then(
            function() {
                $location.path('/admin/diseaseManagement/patientGroupings/' + $scope.disease.id);
            });

    };

}

function getJSONTxLine($scope){

    //var result= JSON.stringify($scope.txLine);
    /*
    console.log("*** name: " + $scope.txLine.name);
    console.log("*** number: " + $scope.txLine.number);
    console.log("*** info: " + $scope.txLine.information);
    */

    return {"number":$scope.txLine.number,
            "name":$scope.txLine.name,
            "information":$scope.txLine.information,
            "primaryGroupA":$scope.selectedDrugsPrimaryGroupA,
            "primaryGroupB":$scope.selectedDrugsPrimaryGroupB,
            "primaryGroupC":$scope.selectedDrugsPrimaryGroupC,
            "secondaryGroupA":$scope.selectedDrugsSecondaryGroupA,
            "secondaryGroupB":$scope.selectedDrugsSecondaryGroupB,
            "secondaryGroupC":$scope.selectedDrugsSecondaryGroupC,
            "tertiaryGroupA":$scope.selectedDrugsTertiaryGroupA,
            "tertiaryGroupB":$scope.selectedDrugsTertiaryGroupB,
            "tertiaryGroupC":$scope.selectedDrugsTertiaryGroupC,
            "dosagePrimaryGroupA": getDosage($scope.selectedDrugsPrimaryGroupA, "dosagePrimaryGroupA-"),
            "dosagePrimaryGroupB": getDosage($scope.selectedDrugsPrimaryGroupB, "dosagePrimaryGroupA-"),
            "dosagePrimaryGroupC": getDosage($scope.selectedDrugsPrimaryGroupC, "dosagePrimaryGroupA-"),
            "dosageSecondaryGroupA": getDosage($scope.selectedDrugsSecondaryGroupA, "dosagePrimaryGroupA-"),
            "dosageSecondaryGroupB": getDosage($scope.selectedDrugsSecondaryGroupB, "dosagePrimaryGroupA-"),
            "dosageSecondaryGroupC": getDosage($scope.selectedDrugsSecondaryGroupC, "dosagePrimaryGroupA-"),
            "dosageTertiaryGroupA": getDosage($scope.selectedDrugsTertiaryGroupA, "dosagePrimaryGroupA-"),
            "dosageTertiaryGroupB": getDosage($scope.selectedDrugsTertiaryGroupB, "dosagePrimaryGroupA-"),
            "dosageTertiaryGroupC": getDosage($scope.selectedDrugsTertiaryGroupC, "dosagePrimaryGroupA-")
            };
}

function getDosage(obj, namePrefix){
    var result = {};
    if(obj != null){
        for(var i=0; i < obj.length; i++){
            var drugName= obj[i];
            var id= namePrefix + drugName;
            var dosage= document.getElementById(id).value;
            result[drugName]= dosage;
        }
    }
    return result;
}

function DiseaseEditPatientGroupingComboCtrl($scope, $location, Restangular, patientGroupingCombo, disease) {

    $scope.patientGroupingCombo= patientGroupingCombo;
    //console.log("*** patientGroupingCombo: %s", JSON.stringify($scope.patientGroupingCombo));

    $scope.disease = disease;

    /*
    if($scope.selectedPatientGroups == null)
        $scope.selectedPatientGroups= [];
   */

    Restangular.all('patientGroups').getList().then(
        function(patientGroups) {
            $scope.patientGroups = patientGroups;
        });

    $scope.cancel= function(){
        $location.path('/admin/diseaseManagement/patientGroupings/' + $scope.disease.id);
    };

    $scope.removePatientGroup= function(patientGroupId){

        for(var i=0; i <= $scope.patientGroupingCombo.patientGroups.length; i++){
            var pgId= $scope.patientGroupingCombo.patientGroups[i].id;
            if(pgId === patientGroupId){
                $scope.patientGroupingCombo.patientGroups.splice(i, 1);
            }
        }
    };

    $scope.addPatientGroup= function(obj){

        //console.log("*** In addPatientGroup...patientGroupingCombo: %s", JSON.stringify($scope.patientGroupingCombo));
        $scope.modeldisplay= '';
        var typeAheadPatientGroupName= obj.target.attributes.data.value;

        if($scope.patientGroupingCombo.patientGroups == null)
            $scope.patientGroupingCombo.patientGroups= [];

        //see if name is already in the group
        var okToAdd= true;
        for(var i=0; i < $scope.patientGroupingCombo.patientGroups.length; i++){

            var pgName= $scope.patientGroupingCombo.patientGroups[i].patientGroupName;
            if(pgName.toLowerCase() === typeAheadPatientGroupName){
                okToAdd= false;
                break;
            }

        }
        if(okToAdd){
            var patientGroupToAdd= {"patientGroupName":typeAheadPatientGroupName};
            $scope.patientGroupingCombo.patientGroups.push(patientGroupToAdd);
        }
    };

    $scope.save= function(){

        $scope.hasValidationErrors= false;

        var comboName= $('#patientGroupComboName').val();

        if($scope.disease.patientGroupCombos == null){
            $scope.disease.patientGroupCombos= {};
        }

        var comboMap= $scope.disease.patientGroupCombos;

        if(comboMap.hasOwnProperty(comboName)){
            //console.log("*** found dup comboName: %s", comboName);
            $scope.hasValidationErrors= true;
        }
        else{
            //console.log("*** NO dup found for: %s", comboName);
        }
        //need to check for duplicate patientGroup set

        /*
         var m= {};
         m[comboName]= $scope.selectedPatientGroups;
         $scope.disease.patientGroupCombos= m;
         */


        var s= getJSONNewPatientGroupingComboForEdit($scope);
        console.log("*** Edit PG post: %s", JSON.stringify(s));

        var diseaseId= $scope.disease.id;

        Restangular.all('diseases/' + diseaseId + '/patientGroupingCombo/' + $scope.patientGroupingCombo.id + "/").post(s).then(
            function() {
                $location.path('/admin/diseaseManagement/patientGroupings/' + $scope.disease.id);
            });



        /* this was commented out already
         for (var key in m) {
         if (m.hasOwnProperty(key)) {
         console.log(key + " -> " + m[key]);
         }
         }

         $.each(m, function(key, value) {
         console.log("*** printing key/val: ");
         console.log(key, value);
         });
         */

    };

}

/**
 * Example PatientGroupings:
 *
 * [{"id":"5649050225344512","Disease":{"id":"5706163895140352","diseaseName":"hypertension",
 *      "aliasNames":["essential hypertension","htn"],"assessmentValues":[{"id":"","assessmentId":"5742796208078848",
 *          "operator":"gt","value":"90"},{"id":"","assessmentId":"5664902681198592","operator":"gt","value":"140"}]},
 *      "patientGroupingName":"firstgrouping","patientGroups":[{"id":"5642554087309312","patientGroupName":"bp stage 1 htn","assessmentValues":null},
 *          {"id":"5760820306771968","patientGroupName":"no comorbidity","assessmentValues":null}]}]
 */
function PatientGroupingsCtrl($scope, $location, Restangular, patientGroupings, disease){

    $scope.disease = disease;

    //console.log("*** PGs: %s", JSON.stringify(patientGroupings));
    $scope.patientGroupings= patientGroupings;
    //console.log("*** patientGroups D: %s", patientGroupings[0].Disease.id);

    //$scope.disease= patientGroupings[0].Disease;
    //console.log("*** disease.id: %s", $scope.disease.id);


    /*
     var m= disease.patientGroupings;
     console.log("*** m: %s", JSON.stringify(m));
     var patientGrouping= {};
     for (var key in m) {
     if (m.hasOwnProperty(key)) {
     console.log(key + " -> " + m[key]);
     patientGrouping['name']= key;
     //patientGrouping['patientGroups]
     }
     }
     disease.patientGroupings.push(patientGrouping);


     $scope.disease = disease;
     */

    /*
     var m= {};
     m['foobar']= ['me', 'my'];
     m['sss']= ['she', 'him'];

     $scope.disease.patientGroupCombos= m;
     */

    /*
     Restangular.all('patientGroups').getList().then(
     function(patientGroups) {
     $scope.patientGroups = patientGroups;
     });
     */
}

function DiseaseNewPatientGroupCombosCtrl($scope, $location, Restangular, disease){

    $scope.disease = disease;

    if($scope.selectedPatientGroups == null)
        $scope.selectedPatientGroups= [];

    Restangular.all('patientGroups').getList().then(
        function(patientGroups) {
            $scope.patientGroups = patientGroups;
        });

    $scope.addPatientGroup= function(obj){

        $scope.modeldisplay= '';
        var typeAheadPatientGroupName= obj.target.attributes.data.value;

        //console.log("*** addPatientGroup name: %s", typeAheadPatientGroupName);
        if($scope.selectedPatientGroups == null)
            $scope.selectedPatientGroups= [];

        var idx= $scope.selectedPatientGroups.indexOf(typeAheadPatientGroupName);
        if(idx === -1)
            $scope.selectedPatientGroups.push(typeAheadPatientGroupName);

    };

    $scope.removePatientGroup= function(patientGroupName){

        var idx= $scope.selectedPatientGroups.indexOf(patientGroupName);
        if(idx > -1)
            $scope.selectedPatientGroups.splice(idx, 1);
    };

    $scope.cancel= function(){
        $location.path('/admin/diseaseManagement/patientGroupings/' + $scope.disease.id);
    };

    $scope.save= function(){

        $scope.hasValidationErrors= false;

        var comboName= $('#patientGroupComboName').val();

        if($scope.disease.patientGroupCombos == null){
            $scope.disease.patientGroupCombos= {};
        }

        var comboMap= $scope.disease.patientGroupCombos;

        if(comboMap.hasOwnProperty(comboName)){
            console.log("*** found dup comboName: %s", comboName);
            $scope.hasValidationErrors= true;
        }
        else{
            console.log("*** NO dup found for: %s", comboName);
        }
        //need to check for duplicate patientGroup set

        /*
        var m= {};
        m[comboName]= $scope.selectedPatientGroups;
        $scope.disease.patientGroupCombos= m;
        */


        var s= getJSONNewPatientGroupingCombo($scope);
        //console.log("*** New PG post: %s", JSON.stringify(s));

        var diseaseId= $scope.disease.id;

        Restangular.all('diseases/' + diseaseId + '/newPatientGroupingCombo').post(s).then(
            function() {
                $location.path('/admin/diseaseManagement/patientGroupings/' + $scope.disease.id);
            });



        /*
        for (var key in m) {
            if (m.hasOwnProperty(key)) {
                console.log(key + " -> " + m[key]);
            }
        }

        $.each(m, function(key, value) {
            console.log("*** printing key/val: ");
            console.log(key, value);
        });
        */

    };


}

function getJSONNewPatientGroupingCombo($scope){

    var patientGroupingName= $('#patientGroupingName').val();

    return {"patientGroupingName":patientGroupingName.toLowerCase(),
            "patientGroupingIds": getPatientGroupingComboIds($scope)};
}

function getJSONSAVEForEdit($scope){

    var patientGroupingName= $('#patientGroupingName').val();

    return {"patientGroupingName":patientGroupingName.toLowerCase(),
            "patientGroupingIds": getPatientGroupingComboIdsForEdit($scope)};
}

function getPatientGroupingComboIdsForEdit($scope){

    var result= [];
    for(var i=0; i < $scope.patientGroups.length; i++){

        var id= $scope.patientGroups[i].id;
        var patientGroupName= $scope.patientGroups[i].patientGroupName;

        for(var k=0; k < $scope.patientGroupingCombo.patientGroups.length; k++){
            if($scope.patientGroupingCombo.patientGroups[k].patientGroupName.toLowerCase() === patientGroupName.toLowerCase()){
                result.push(id);
                break;
            }
        }
    }
    return result;
}

function getPatientGroupingComboIds($scope){

    var result= [];
    for(var i=0; i < $scope.patientGroups.length; i++){

        var id= $scope.patientGroups[i].id;
        var patientGroupName= $scope.patientGroups[i].patientGroupName;
        for(var k=0; k < $scope.selectedPatientGroups.length; k++){
            if($scope.selectedPatientGroups[k].toLowerCase() === patientGroupName.toLowerCase()){
                result.push(id);
                break;
            }
        }
    }
    return result;
}

function DiseaseEditCtrl($scope, $location, Restangular, disease, $filter, $http) {

    // Assessments
    Restangular.all('assessments').getList().then(
        function(assessments) {
            $scope.assessments = assessments;
            //console.log(JSON.stringify($scope.diseases));
        });
    // End Assessments

    $scope.selectedDisease = disease;

    var originalDiseaseName= $scope.selectedDisease.diseaseName;
    var originalSortedAliasNames= [];

    if($scope.selectedDisease.aliasNames != undefined) {
        $scope.selectedDisease.aliasNames.sort();
        for (var i = 0; i < $scope.selectedDisease.aliasNames.length; i++){
            originalSortedAliasNames.push($scope.selectedDisease.aliasNames[i]);
        }
    }

    var allExistingDiseaseNames= [];
    Restangular.all('diseases').getList().then(
        function(diseases) {
            $scope.diseases = diseases;

            for(var i=0; i < $scope.diseases.length; i++){
                allExistingDiseaseNames.push($scope.diseases[i].diseaseName);
                if($scope.diseases[i].aliasNames != undefined){
                    for(var j=0; j < $scope.diseases[i].aliasNames.length; j++){
                        allExistingDiseaseNames.push($scope.diseases[i].aliasNames[j]);
                    }
                }
            }

            //take out disease names from 'allExistingDiseaseNames' that are in the selectedDisease(main and alias names)
            var idx= allExistingDiseaseNames.indexOf(originalDiseaseName);
            allExistingDiseaseNames.splice(idx, 1);
            for(var z= 0; z < originalSortedAliasNames.length; z++){
                idx= allExistingDiseaseNames.indexOf(originalSortedAliasNames[z]);
                allExistingDiseaseNames.splice(idx, 1);
            }

        });


    //alias names
    $scope.aliasNames= $scope.selectedDisease.aliasNames;
    if($scope.selectedDisease.aliasNames == undefined)
        $scope.selectedDisease.aliasNames= [];

    $scope.addAliasNameField= function(){

        var size= $scope.selectedDisease.aliasNames.length;
        if(size === 0){
            $scope.selectedDisease.aliasNames[0]= "";
        }
        else{
            var addField= true;
            for(var i=0; i < size; i++) {
                var id = "ans-" + i;
                var val = document.getElementById(id).value;
                if(val.length === 0)
                    addField= false;
            }
            if(addField) {
                $scope.selectedDisease.aliasNames[size] = "";
            }
        }

    };

    $scope.deleteAliasNameField= function(e){
        $scope.selectedDisease.aliasNames.splice(e, 1);
    };

    $scope.cancel= function(){
        $location.path('/admin/diseaseManagement');
    };

    $scope.isDuplicateDiseaseName= false;
    $scope.isDuplicateAliasDiseaseName= false;

    $scope.resetDuplicateDiseaseName= function(){
        $scope.isDuplicateDiseaseName= false;
        $scope.selectedDisease.diseaseName= originalDiseaseName;
    };

    $scope.save= function(){

        //console.log("*** original name: " + originalDiseaseName);
        //console.log("*** new name: " + $scope.selectedDisease.diseaseName);
        //console.log("*** saving: " + JSON.stringify($scope.selectedDisease));

        if(originalDiseaseName != $scope.selectedDisease.diseaseName) {

            for(var i=0; i < allExistingDiseaseNames.length; i++){
                if($scope.selectedDisease.diseaseName.toLowerCase() == allExistingDiseaseNames[i].toLowerCase()){
                    $scope.isDuplicateDiseaseName= true;
                    break;
                }
            }
        }

        var newAliasNames= [];
        $scope.duplicateAliasNames= [];
        var sortedAliasNames= [];
        if($scope.selectedDisease.aliasNames != undefined)
            sortedAliasNames= $scope.selectedDisease.aliasNames.sort();

        if(sortedAliasNames.length > 0 && originalSortedAliasNames.length === 0){

            for(var i=0; i < sortedAliasNames.length; i++) {
                for (var j = 0; j < allExistingDiseaseNames.length; j++) {
                    if (sortedAliasNames[i] == allExistingDiseaseNames[j]) {
                        $scope.duplicateAliasNames.push(sortedAliasNames[i]);
                        $scope.isDuplicateAliasDiseaseName = true;
                        break;
                    }
                }
            }

        }
        if(sortedAliasNames.length > 0 && originalSortedAliasNames.length > 0){

            for(var i=0; i < sortedAliasNames.length; i++){
                if(originalSortedAliasNames[i] != undefined
                    && (sortedAliasNames[i] != originalSortedAliasNames[i])){


                    for(var k=0; k < sortedAliasNames.length; k++) {
                        for (var j = 0; j < allExistingDiseaseNames.length; j++) {
                            if (sortedAliasNames[k] == allExistingDiseaseNames[j]) {
                                if($scope.duplicateAliasNames.indexOf(sortedAliasNames[k]) == -1){
                                    $scope.duplicateAliasNames.push(sortedAliasNames[k]);
                                }
                                $scope.isDuplicateAliasDiseaseName = true;
                                break;
                            }
                        }
                    }

                }
                else if(originalSortedAliasNames[i] == undefined){

                    for(var k=0; k < sortedAliasNames.length; k++) {
                        for (var j = 0; j < allExistingDiseaseNames.length; j++) {
                            if (sortedAliasNames[k] == allExistingDiseaseNames[j]) {
                                if($scope.duplicateAliasNames.indexOf(sortedAliasNames[k]) == -1){
                                    $scope.duplicateAliasNames.push(sortedAliasNames[k]);
                                }
                                $scope.isDuplicateAliasDiseaseName = true;
                                break;
                            }
                        }
                    }
                }

            }
        }

        $scope.clearDuplicateAliasDiseaseName= function(){
            $scope.duplicateAliasNames= [];
            $scope.isDuplicateAliasDiseaseName= false;
        };

        if(!$scope.isDuplicateDiseaseName
                        &&!$scope.isDuplicateAliasDiseaseName){

            //console.log("*** saving: " + JSON.stringify($scope.selectedDisease));
            var s = getEditDiseaseJSONPOST($scope);
            //console.log("*** s in edit: " + JSON.stringify(s));

             Restangular.all('diseases/edit').post(s).then(
                function() {
                    $location.path('/admin/diseaseManagement');
                });

        }

    };

    $scope.delete= function(){

        Restangular.one('diseases/' + $scope.selectedDisease.id + "/").remove().then(
            function() {
                $location.path('/admin/diseaseManagement');
            });
    };


    $scope.pageLoaded= function() {
            for (var i = 0; i < $scope.selectedDisease.assessmentValues.length; i++) {
                var outerAssessmentId = $scope.selectedDisease.assessmentValues[i].assessmentId;
                for (var j = 0; j < $scope.assessments.length; j++) {
                    var assId = "ass-" + j;
                    var assessmentValue= document.getElementById(assId).value;
                    if (outerAssessmentId === assessmentValue) {
                        var cbId = "cb-" + j;
                        var inId = "#in-" + j;
                        var selId = "#sel-" + j;
                        document.getElementById(cbId).checked = true;
                        $(selId).val($scope.selectedDisease.assessmentValues[i].operator);
                        $(inId).val($scope.selectedDisease.assessmentValues[i].value);
                        break;
                    }
                }
            }
            return false;
        };
}
/*
function getAssessmentValues($scope){

    var assessmentArray= [];
    for (var j = 0; j < $scope.assessments.length; j++) {
        //var assId = "ass-" + j;
        //var assessmentValue= document.getElementById(assId).value;
        //if (outerAssessmentId === assessmentValue) {
            var cbId = "cb-" + j;
            var inId = "#in-" + j;
            var selId = "#sel-" + j;
            //console.log("*** cb[ " + j + "] checked: " + document.getElementById(cbId).checked);
            if(document.getElementById(cbId).checked){
                console.log("*** sel: " + $(selId).val());
                console.log("*** in: " + $(inId).val());
            }

            //document.getElementById(cbId).checked = true;
            //$(selId).val($scope.selectedDisease.assessmentValues[i].operator);
            //$(inId).val($scope.selectedDisease.assessmentValues[i].value);
            //break;
        //}
    }

}
*/

function DiseaseListCtrl($scope, Restangular, printingService) {

    Restangular.all('diseases').getList().then(
        function(diseases) {
            $scope.diseases = diseases;
            //console.log(JSON.stringify($scope.diseases));
        });

    $scope.listAliasNames= function(aliasNames){
        if(aliasNames != null)
            return printingService.listArray(aliasNames);
    };
}

function DiseaseNewCtrl($scope, Restangular, $location, $http){

    //Assessment

    Restangular.all('assessments').getList().then(
        function(assessments) {
            $scope.assessments = assessments;
            //console.log(JSON.stringify($scope.diseases));
        });

    $scope.listAliasNames= function(aliasNames){
        if(aliasNames != null)
            return printingService.listArray(aliasNames);
    };

    //end Assessment

    var allExistingDiseaseNames= [];
    Restangular.all('diseases').getList().then(
        function(diseases) {
            $scope.diseases = diseases;

            for(var i=0; i < $scope.diseases.length; i++){
                allExistingDiseaseNames.push($scope.diseases[i].diseaseName);
                if($scope.diseases[i].aliasNames != undefined){
                    for(var j=0; j < $scope.diseases[i].aliasNames.length; j++){
                        allExistingDiseaseNames.push($scope.diseases[i].aliasNames[j]);
                    }
                }
            }
        });


    $scope.isDuplicateDiseaseName= false;
    $scope.isDuplicateAliasDiseaseName= false;

    $scope.resetDuplicateDiseaseName= function(){
        $scope.isDuplicateDiseaseName= false;
    };

    $scope.checkDuplicateDiseaseName= function(diseaseName){

        if(allExistingDiseaseNames.indexOf(diseaseName.toLowerCase()) > -1)
            $scope.isDuplicateDiseaseName= true;
    };

    var duplicateAliasDiseaseNames= [];
    $scope.duplicateAliasDiseaseNames= duplicateAliasDiseaseNames;

    $scope.addAliasDiseaseName= function(index){

        var id= "ans-" + index;
        var aliasNameOfDisease= document.getElementById(id).value;

        if(allExistingDiseaseNames.indexOf(aliasNameOfDisease) > -1) {
            if ($scope.duplicateAliasDiseaseNames.indexOf(aliasNameOfDisease) == -1)
                $scope.duplicateAliasDiseaseNames.push(aliasNameOfDisease);
        }
    };

    $scope.clearDuplicateAliasDiseaseNames= function(){

        //console.log(" brandNames beginning of clear: " + JSON.stringify($scope.brandNames));
        var nonDuplicateAliasDiseaseNames= [];
        //$scope.dups= [];
        for(var i=0; i<= $scope.aliasNames.length; i++){
            var id= "ans-" + i;
            var aliasNameOfDisease= document.getElementById(id).value;
            if($scope.duplicateAliasDiseaseNames.indexOf(aliasNameOfDisease) > -1){
                $scope.aliasNames.splice(i, 1);
            }else{
                nonDuplicateAliasDiseaseNames.push(aliasNameOfDisease);
            }
        }

        $scope.dups= nonDuplicateAliasDiseaseNames;

        //reset brandNames array to start at zero
        var quantityInAliasNamesArray= $scope.aliasNames.length;
        $scope.aliasNames= [];
        if(nonDuplicateAliasDiseaseNames.length > 0) {
            for (var j = 0; j < quantityInAliasNamesArray; j++) {
                $scope.aliasNames.push(j);
            }
        }

        $scope.showDuplicateAliasDiseaseNames= false;
        $scope.duplicateAliasDiseaseNames= [];
    };


    //alias names
    var aliasNames= [];
    $scope.aliasNames= aliasNames;
    $scope.addAliasNameField= function(){

        var size= $scope.aliasNames.length;
        $scope.aliasNames.push(size + 1);
    };
    $scope.deleteAliasNameField= function(e){
        $scope.aliasNames.splice(e, 1);
    };
    //end alias names

    $scope.save= function(){

        if($scope.duplicateAliasDiseaseNames.length > 0){
            $scope.showDuplicateAliasDiseaseNames= true;
        }else {

            var s = getDiseaseJSONPOST($scope);
            //console.log("*** disease POST: " + JSON.stringify(s));

            Restangular.all('diseases/new').post(s).then(
                function (disease) {
                    $location.path('/admin/diseaseManagement');
                });
        }
    };

    $scope.cancel= function(){
        $location.path('/admin/diseaseManagement');
    };

}

function getDiseaseJSONPOST($scope){

    var nameOfDisease= document.getElementById("diseaseName").value;
    var aliasNamesArray= getAliasNames($scope);
    var assessmentMap= getAssessmentMap($scope);
    return {"diseaseName":nameOfDisease.toLowerCase(),
                "aliasNames": aliasNamesArray,
                "assessments": assessmentMap};
}

function getEditDiseaseJSONPOST($scope){

    return {"id":$scope.selectedDisease.id,
            "diseaseName":$scope.selectedDisease.diseaseName.toLowerCase(),
            "aliasNames":$scope.selectedDisease.aliasNames,
            "assessmentValues":getAssessmentMap($scope)
            };
}

function getAssessmentMap($scope){
    var objs= [];
    var size= $scope.assessments.length;
    for(var i=0; i < size; i++){
        var assessmentId= "ass-" + i;
        var cbId= "cb-" + i;
        var selId= "sel-" + i;
        var inId= "in-" + i;
        if(document.getElementById(cbId).checked){
            var assessmentIdVal= document.getElementById(assessmentId).value;
            var operatorVal= document.getElementById(selId).value;
            var inVal= document.getElementById(inId).value;
            var assessment= {
                assessmentId: assessmentIdVal,
                operator: operatorVal,
                value: inVal
            };
            objs.push(assessment);
        }
    }
    return objs;
}

function getAliasNames($scope){

    var aliasNamesArray= [];
    for(var i=0; i< $scope.aliasNames.length; i++){
        var id= "ans-" + i
        var el= document.getElementById(id);
        aliasNamesArray.push(el.value.toLowerCase());
    }
    return aliasNamesArray;
}

function DiseaseDetailCtrl(){

}

function setUpTxOptionSections($scope){

    $scope.selectedSection= "Drug Option Sections";
    $scope.navSection= true;
    $scope.primarySection= false;
    $scope.secondarySection= false;
    $scope.tertiarySection= false;

    $scope.optionSection= function(section){
        if(section === 'nav'){
            $scope.selectedSection= "Drug Option Sections";
            $scope.navSection= true;
            $scope.primarySection= false;
            $scope.secondarySection= false;
            $scope.tertiarySection= false;
        }
        if(section === 'primary'){
            $scope.selectedSection= "Selected Drug Section: Primary...click to go back";
            $scope.navSection= false;
            $scope.primarySection= true;
            $scope.secondarySection= false;
            $scope.tertiarySection= false;
        }
        if(section === 'secondary'){
            $scope.selectedSection= "Selected Drug Section: Secondary...click to go back";
            $scope.navSection= false;
            $scope.primarySection= false;
            $scope.secondarySection= true;
            $scope.tertiarySection= false;
        }
        if(section === 'tertiary'){
            $scope.selectedSection= "Selected Drug Section: Tertiary...click to go back";
            $scope.navSection= false;
            $scope.primarySection= false;
            $scope.secondarySection= false;
            $scope.tertiarySection= true;
        }

    }
}