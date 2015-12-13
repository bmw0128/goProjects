app.config(function($routeProvider, RestangularProvider) {

    !$routeProvider.

        when('/admin/txLineManagement/edit/:txId/disease/:diseaseId/patientGroupingCombo/:pgId', {
            controller: TxLineEditCtrl,
            templateUrl: 'frontend/partials/admin/disease-patientGroupingCombo-txLine.html',
            resolve: {
                txLine: function(Restangular, $route){
                    var theRoute= 'txline/edit/' + $route.current.params.txId + '/';
                    return Restangular.one(theRoute).get();
                },
                patientGroupingCombo: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/patientGroupingCombo/' + $route.current.params.pgId + '/';
                    return Restangular.one(theRoute).get();
                },
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        })
});

function setExistingDrugsForEdit($scope){

    $scope.selectedDrugsPrimaryGroupA= [];
    $scope.selectedDrugsPrimaryGroupB= [];
    $scope.selectedDrugsPrimaryGroupC= [];

    $scope.selectedDrugsSecondaryGroupA= [];
    $scope.selectedDrugsSecondaryGroupB= [];
    $scope.selectedDrugsSecondaryGroupC= [];

    $scope.selectedDrugsTertiaryGroupA= [];
    $scope.selectedDrugsTertiaryGroupB= [];
    $scope.selectedDrugsTertiaryGroupC= [];

    if($scope.txLine.dosagePrimaryGroupA == null){
        $scope.txLine.dosagePrimaryGroupA= [];
    }
    if($scope.txLine.dosagePrimaryGroupB == null){
        $scope.txLine.dosagePrimaryGroupB= [];
    }
    if($scope.txLine.dosagePrimaryGroupC == null){
        $scope.txLine.dosagePrimaryGroupC= [];
    }

    if($scope.txLine.dosageSecondaryGroupA == null){
        $scope.txLine.dosageSecondaryGroupA= [];
    }
    if($scope.txLine.dosageSecondaryGroupB == null){
        $scope.txLine.dosageSecondaryGroupB= [];
    }
    if($scope.txLine.dosageSecondaryGroupC == null){
        $scope.txLine.dosageSecondaryGroupC= [];
    }

    if($scope.txLine.dosageTertiaryGroupA == null){
        $scope.txLine.dosageTertiaryGroupA= [];
    }
    if($scope.txLine.dosageTertiaryGroupB == null){
        $scope.txLine.dosageTertiaryGroupB= [];
    }
    if($scope.txLine.dosageTertiaryGroupC == null){
        $scope.txLine.dosageTertiaryGroupC= [];
    }



    for(var y=0; y < $scope.txLine.dosagePrimaryGroupA.length; y++){
        $scope.selectedDrugsPrimaryGroupA.push($scope.txLine.dosagePrimaryGroupA[y]);
    }
    for(var y=0; y < $scope.txLine.dosagePrimaryGroupB.length; y++){
        $scope.selectedDrugsPrimaryGroupB.push($scope.txLine.dosagePrimaryGroupB[y]);
    }
    for(var y=0; y < $scope.txLine.dosagePrimaryGroupC.length; y++){
        $scope.selectedDrugsPrimaryGroupC.push($scope.txLine.dosagePrimaryGroupC[y]);
    }

    for(var y=0; y < $scope.txLine.dosageSecondaryGroupA.length; y++){
        $scope.selectedDrugsPrimaryGroupA.push($scope.txLine.dosageSecondaryGroupA[y]);
    }
    for(var y=0; y < $scope.txLine.dosageSecondaryGroupB.length; y++){
        $scope.selectedDrugsPrimaryGroupB.push($scope.txLine.dosageSecondaryGroupB[y]);
    }
    for(var y=0; y < $scope.txLine.dosageSecondaryGroupC.length; y++){
        $scope.selectedDrugsPrimaryGroupC.push($scope.txLine.dosageSecondaryGroupC[y]);
    }

    for(var y=0; y < $scope.txLine.dosageTertiaryGroupA.length; y++){
        $scope.selectedDrugsPrimaryGroupA.push($scope.txLine.dosageTertiaryGroupA[y]);
    }
    for(var y=0; y < $scope.txLine.dosageTertiaryGroupB.length; y++){
        $scope.selectedDrugsPrimaryGroupB.push($scope.txLine.dosageTertiaryGroupB[y]);
    }
    for(var y=0; y < $scope.txLine.dosageTertiaryGroupC.length; y++){
        $scope.selectedDrugsPrimaryGroupC.push($scope.txLine.dosageTertiaryGroupC[y]);
    }


}

function TxLineEditCtrl($scope, $location, Restangular, txLine, patientGroupingCombo, disease){

    $scope.txLine= txLine;
    $scope.disease= disease;
    $scope.patientGroupingCombo= patientGroupingCombo;

    setExistingDrugsForEdit($scope);

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


    setUpTxOptionSections($scope);

    $scope.cancel= function(){
        $location.path('/admin/diseaseManagement/disease/' + $scope.disease.id
                            + '/patientGroupingCombo/' + $scope.patientGroupingCombo.id + '/tx/list');
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

        //console.log("*** saving this TxLine: %s", JSON.stringify($scope.txLine));
        var s= getJSONTxLineForSave($scope);

        Restangular.all('txline/patientGroupingCombo/' + $scope.patientGroupingCombo.id + "/").post(s).then(
            function() {
                //$location.path('/admin/diseaseManagement/patientGroupings/' + $scope.disease.id);
                $location.path('/admin/diseaseManagement/disease/' + $scope.disease.id
                    + '/patientGroupingCombo/' + $scope.patientGroupingCombo.id + '/tx/list');
            });

    };

}

function getJSONTxLineForSave($scope){

    return {"id": $scope.txLine.id,
        "pgcId": $scope.txLine.pgcId,
        "number":$scope.txLine.number,
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
        "dosagePrimaryGroupA": getDosageForSave($scope.selectedDrugsPrimaryGroupA, "dosagePrimaryGroupA-"),
        "dosagePrimaryGroupB": getDosageForSave($scope.selectedDrugsPrimaryGroupB, "dosagePrimaryGroupB-"),
        "dosagePrimaryGroupC": getDosageForSave($scope.selectedDrugsPrimaryGroupC, "dosagePrimaryGroupC-"),
        "dosageSecondaryGroupA": getDosageForSave($scope.selectedDrugsSecondaryGroupA, "dosageSecondaryGroupA-"),
        "dosageSecondaryGroupB": getDosageForSave($scope.selectedDrugsSecondaryGroupB, "dosageSecondaryGroupB-"),
        "dosageSecondaryGroupC": getDosageForSave($scope.selectedDrugsSecondaryGroupC, "dosageSecondaryGroupC-"),
        "dosageTertiaryGroupA": getDosageForSave($scope.selectedDrugsTertiaryGroupA, "dosageTertiaryGroupA-"),
        "dosageTertiaryGroupB": getDosageForSave($scope.selectedDrugsTertiaryGroupB, "dosageTertiaryGroupB-"),
        "dosageTertiaryGroupC": getDosageForSave($scope.selectedDrugsTertiaryGroupC, "dosageTertiaryGroupC-")
    };
}

function getDosageForSave(obj, namePrefix){
    var result = [];
    if(obj != null){
        for(var i=0; i < obj.length; i++){
            var drugName= obj[i].drugName;
            var id= namePrefix + drugName;
            var dosage= document.getElementById(id).value;
            var dosageObj= {
                drugName: drugName,
                dosage: dosage
            };
            result.push(dosageObj);
        }
    }
    return result;

}