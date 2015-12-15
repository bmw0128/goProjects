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
        }).

        when('/admin/txLineManagement/disease/:diseaseId/patientGroupingCombo/:pgId/tx/new',{
            controller:TxLineEditCtrl,
            templateUrl: 'frontend/partials/admin/disease-patientGroupingCombo-txLine.html',
            resolve: {
                patientGroupingCombo: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/patientGroupingCombo/' + $route.current.params.pgId + '/';
                    return Restangular.one(theRoute).get();
                },
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.diseaseId + '/';
                    return Restangular.one(theRoute).get();
                },
                txLine: function(){
                    return null;
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

    /**
     * Example of Dosage, note that it contains both the drugName and dosage:
     * "dosagePrimaryGroupB":[{"drugName":"trandolapril","dosage":"5mg - 7mg per day"},
     *                                  {"drugName":"norco","dosage":"56ng every other day"}],
     *
     *  So, it's like adding a Drug object to the array: Drug{drugName:'xyz', dosage:'10mg'}
     */

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
        $scope.selectedDrugsSecondaryGroupA.push($scope.txLine.dosageSecondaryGroupA[y]);
    }
    for(var y=0; y < $scope.txLine.dosageSecondaryGroupB.length; y++){
        $scope.selectedDrugsSecondaryGroupB.push($scope.txLine.dosageSecondaryGroupB[y]);
    }
    for(var y=0; y < $scope.txLine.dosageSecondaryGroupC.length; y++){
        $scope.selectedDrugsSecondaryGroupC.push($scope.txLine.dosageSecondaryGroupC[y]);
    }

    for(var y=0; y < $scope.txLine.dosageTertiaryGroupA.length; y++){
        $scope.selectedDrugsTertiaryGroupA.push($scope.txLine.dosageTertiaryGroupA[y]);
    }
    for(var y=0; y < $scope.txLine.dosageTertiaryGroupB.length; y++){
        $scope.selectedDrugsTertiaryGroupB.push($scope.txLine.dosageTertiaryGroupB[y]);
    }
    for(var y=0; y < $scope.txLine.dosageTertiaryGroupC.length; y++){
        $scope.selectedDrugsTertiaryGroupC.push($scope.txLine.dosageTertiaryGroupC[y]);
    }

}

function TxLineEditCtrl($scope, $location, Restangular, txLine, patientGroupingCombo, disease){

    if(txLine != null)
        $scope.txLine= txLine;
    $scope.disease= disease;
    $scope.patientGroupingCombo= patientGroupingCombo;

    if(txLine != null)
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
        var drug= {drugName:'',dosage:''};
        drug.drugName= typeAheadDrugNameGroupA;

        if($scope.selectedDrugsPrimaryGroupA == null)
            $scope.selectedDrugsPrimaryGroupA= [];

        var addToList= true;
        for(var i=0; i < $scope.selectedDrugsPrimaryGroupA.length; i++){
            var aDrugName= $scope.selectedDrugsPrimaryGroupA[i].drugName;
            if(aDrugName === typeAheadDrugNameGroupA){
                addToList= false;
                break;
            }
        }
        if(addToList){
            $scope.selectedDrugsPrimaryGroupA.push(drug);
        }
    };

    $scope.removeDrugPrimaryGroupA= function(drugIndexGroupA){
        $scope.selectedDrugsPrimaryGroupA.splice(drugIndexGroupA, 1);
    };

    $scope.addDrugPrimaryGroupB= function(obj){
        $scope.modeldisplayB= '';
        var typeAheadDrugNameGroupB= obj.target.attributes.data.value;
        var drug= {drugName:'',dosage:''};
        drug.drugName= typeAheadDrugNameGroupB;

        if($scope.selectedDrugsPrimaryGroupB == null)
            $scope.selectedDrugsPrimaryGroupB= [];

        var addToList= true;
        for(var i=0; i < $scope.selectedDrugsPrimaryGroupB.length; i++){
            var aDrugName= $scope.selectedDrugsPrimaryGroupB[i].drugName;
            if(aDrugName === typeAheadDrugNameGroupB){
                addToList= false;
                break;
            }
        }
        if(addToList){
            $scope.selectedDrugsPrimaryGroupB.push(drug);
        }
    };

    $scope.removeDrugPrimaryGroupB= function(drugIndexGroupB){
        $scope.selectedDrugsPrimaryGroupB.splice(drugIndexGroupB, 1);
    };

    $scope.addDrugPrimaryGroupC= function(obj){
        $scope.modeldisplayC= '';
        var typeAheadDrugNameGroupC= obj.target.attributes.data.value;
        var drug= {drugName:'',dosage:''};
        drug.drugName= typeAheadDrugNameGroupC;

        if($scope.selectedDrugsPrimaryGroupC == null)
            $scope.selectedDrugsPrimaryGroupC= [];

        var addToList= true;
        for(var i=0; i < $scope.selectedDrugsPrimaryGroupC.length; i++){
            var aDrugName= $scope.selectedDrugsPrimaryGroupC[i].drugName;
            if(aDrugName === typeAheadDrugNameGroupC){
                addToList= false;
                break;
            }
        }
        if(addToList){
            $scope.selectedDrugsPrimaryGroupC.push(drug);
        }
    };

    $scope.removeDrugPrimaryGroupC= function(drugIndexGroupC){
        $scope.selectedDrugsPrimaryGroupC.splice(drugIndexGroupC, 1);
    };
    //end Primary Drugs

    //Secondary Drugs
    $scope.addDrugSecondaryGroupA= function(obj){

        $scope.modeldisplaySecA= '';
        var typeAheadDrugNameGroupA= obj.target.attributes.data.value;
        var drug= {drugName:'',dosage:''};
        drug.drugName= typeAheadDrugNameGroupA;

        if($scope.selectedDrugsSecondaryGroupA == null)
            $scope.selectedDrugsSecondaryGroupA= [];

        var addToList= true;
        for(var i=0; i < $scope.selectedDrugsSecondaryGroupA.length; i++){
            var aDrugName= $scope.selectedDrugsSecondaryGroupA[i].drugName;
            if(aDrugName === typeAheadDrugNameGroupA){
                addToList= false;
                break;
            }
        }
        if(addToList){
            $scope.selectedDrugsSecondaryGroupA.push(drug);
        }
    };

    $scope.removeDrugSecondaryGroupA= function(drugIndexGroupA){
        $scope.selectedDrugsSecondaryGroupA.splice(drugIndexGroupA, 1);
    };

    $scope.addDrugSecondaryGroupB= function(obj){

        $scope.modeldisplaySecB= '';
        var typeAheadDrugNameGroupB= obj.target.attributes.data.value;
        var drug= {drugName:'',dosage:''};
        drug.drugName= typeAheadDrugNameGroupB;

        if($scope.selectedDrugsSecondaryGroupB == null)
            $scope.selectedDrugsSecondaryGroupB= [];

        var addToList= true;
        for(var i=0; i < $scope.selectedDrugsSecondaryGroupB.length; i++){
            var aDrugName= $scope.selectedDrugsSecondaryGroupB[i].drugName;
            if(aDrugName === typeAheadDrugNameGroupB){
                addToList= false;
                break;
            }
        }
        if(addToList){
            $scope.selectedDrugsSecondaryGroupB.push(drug);
        }
    };

    $scope.removeDrugSecondaryGroupB= function(drugIndexGroupB){
        $scope.selectedDrugsSecondaryGroupB.splice(drugIndexGroupB, 1);
    };

    $scope.addDrugSecondaryGroupC= function(obj){

        $scope.modeldisplaySecC= '';
        var typeAheadDrugNameGroupC= obj.target.attributes.data.value;
        var drug= {drugName:'',dosage:''};
        drug.drugName= typeAheadDrugNameGroupC;

        if($scope.selectedDrugsSecondaryGroupC == null)
            $scope.selectedDrugsSecondaryGroupC= [];

        var addToList= true;
        for(var i=0; i < $scope.selectedDrugsSecondaryGroupC.length; i++){
            var aDrugName= $scope.selectedDrugsSecondaryGroupC[i].drugName;
            if(aDrugName === typeAheadDrugNameGroupC){
                addToList= false;
                break;
            }
        }
        if(addToList){
            $scope.selectedDrugsSecondaryGroupC.push(drug);
        }
    };

    $scope.removeDrugSecondaryGroupC= function(drugIndexGroupC){
        $scope.selectedDrugsSecondaryGroupC.splice(drugIndexGroupC, 1);
    };
    //end Secondary Drugs

    //Tertiary Drugs
    $scope.addDrugTertiaryGroupA= function(obj){

        $scope.modeldisplayTerA= '';
        var typeAheadDrugNameGroupA= obj.target.attributes.data.value;
        var drug= {drugName:'',dosage:''};
        drug.drugName= typeAheadDrugNameGroupA;

        if($scope.selectedDrugsTertiaryGroupA == null)
            $scope.selectedDrugsTertiaryGroupA= [];

        var addToList= true;
        for(var i=0; i < $scope.selectedDrugsTertiaryGroupA.length; i++){
            var aDrugName= $scope.selectedDrugsTertiaryGroupA[i].drugName;
            if(aDrugName === typeAheadDrugNameGroupA){
                addToList= false;
                break;
            }
        }
        if(addToList){
            $scope.selectedDrugsTertiaryGroupA.push(drug);
        }
    };

    $scope.removeDrugTertiaryGroupA= function(drugIndexGroupA){
        $scope.selectedDrugsTertiaryGroupA.splice(drugIndexGroupA, 1);
    };

    $scope.addDrugTertiaryGroupB= function(obj){
        $scope.modeldisplayTerB= '';
        var typeAheadDrugNameGroupB= obj.target.attributes.data.value;
        var drug= {drugName:'',dosage:''};
        drug.drugName= typeAheadDrugNameGroupB;

        if($scope.selectedDrugsTertiaryGroupB == null)
            $scope.selectedDrugsTertiaryGroupB= [];

        var addToList= true;
        for(var i=0; i < $scope.selectedDrugsTertiaryGroupB.length; i++){
            var aDrugName= $scope.selectedDrugsTertiaryGroupB[i].drugName;
            if(aDrugName === typeAheadDrugNameGroupB){
                addToList= false;
                break;
            }
        }
        if(addToList){
            $scope.selectedDrugsTertiaryGroupB.push(drug);
        }
    };

    $scope.removeDrugTertiaryGroupB= function(drugIndexGroupB){
        $scope.selectedDrugsTertiaryGroupB.splice(drugIndexGroupB, 1);
    };

    $scope.addDrugTertiaryGroupC= function(obj){
        $scope.modeldisplayTerC= '';
        var typeAheadDrugNameGroupC= obj.target.attributes.data.value;
        var drug= {drugName:'',dosage:''};
        drug.drugName= typeAheadDrugNameGroupC;

        if($scope.selectedDrugsTertiaryGroupC == null)
            $scope.selectedDrugsTertiaryGroupC= [];

        var addToList= true;
        for(var i=0; i < $scope.selectedDrugsTertiaryGroupC.length; i++){
            var aDrugName= $scope.selectedDrugsTertiaryGroupC[i].drugName;
            if(aDrugName === typeAheadDrugNameGroupC){
                addToList= false;
                break;
            }
        }
        if(addToList){
            $scope.selectedDrugsTertiaryGroupC.push(drug);
        }
    };

    $scope.removeDrugTertiaryGroupC= function(drugIndexGroupC){
        $scope.selectedDrugsTertiaryGroupC.splice(drugIndexGroupC, 1);
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