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

        when('/admin/diseaseManagement/tx/:id',{
            controller:DiseaseTxCtrl,
            templateUrl: 'frontend/partials/admin/disease-tx.html',
            resolve: {
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        }).

        when('/admin/diseaseManagement/patientGroupCombos/new/:id',{
            controller:DiseaseNewPatientGroupCombosCtrl,
            templateUrl: 'frontend/partials/admin/disease-newPatientGroupCombo.html',
            resolve: {
                disease: function(Restangular, $route){
                    var theRoute= 'diseases/' + $route.current.params.id + '/';
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

function DiseaseTxCtrl($scope, $location, Restangular, disease, $filter, $http){

    disease.patientGroupCombos= [];

    $scope.disease = disease;

    Restangular.all('patientGroups').getList().then(
        function(patientGroups) {
            $scope.patientGroups = patientGroups;
        });

}

function DiseaseNewPatientGroupCombosCtrl($scope, Restangular, disease){

    disease.patientGroupCombos= [];

    $scope.disease = disease;

    $scope.selectedPatientGroups= [];

    Restangular.all('patientGroups').getList().then(
        function(patientGroups) {
            $scope.patientGroups = patientGroups;
        });

    $scope.addPatientGroup= function(obj){

        $scope.modeldisplay= '';
        //$scope.showNewInteractionDrug= true;
        var typeAheadPatientGroupName= obj.target.attributes.data.value;

        console.log("*** addPatientGroup name: %s", typeAheadPatientGroupName);
        /*
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
        */

    };


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