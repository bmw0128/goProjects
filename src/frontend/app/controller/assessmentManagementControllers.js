app.config(function($routeProvider, RestangularProvider) {

    !$routeProvider.

        when('/admin/assessmentManagement', {
            controller: AssessmentListCtrl,
            templateUrl: 'frontend/partials/admin/assessment-list.html'
        }).

        when('/admin/assessmentManagement/new', {
            controller: AssessmentNewCtrl,
            templateUrl: 'frontend/partials/admin/assessment-new.html'
        }).

        when('/admin/assessmentManagement/edit/:id',{
            controller:AssessmentEditCtrl,
            templateUrl: 'frontend/partials/admin/assessment-edit.html',
            resolve: {
                assessment: function(Restangular, $route){
                    var theRoute= 'assessments/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        }).

        when('/admin/assessmentManagement/detail/:id',{
            controller:AssessmentDetailCtrl,
            templateUrl: 'frontend/partials/admin/assessment-detail.html',
            resolve: {
                assessment: function(Restangular, $route){
                    var theRoute= 'assessments/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        })
});

function AssessmentListCtrl($scope, Restangular, printingService) {

    Restangular.all('assessments').getList().then(
        function(assessments) {
            $scope.assessments = assessments;
            //console.log(JSON.stringify($scope.diseases));
        });

    $scope.listAliasNames= function(aliasNames){
        if(aliasNames != null)
            return printingService.listArray(aliasNames);
    };

}

function AssessmentEditCtrl($scope, $location, Restangular, assessment, $filter, $http) {

    $scope.selectedAssessment = assessment;

    var originalAssessmentName= $scope.selectedAssessment.assessmentName;
    var originalSortedAliasNames= [];

    if($scope.selectedAssessment.aliasNames != undefined) {
        $scope.selectedAssessment.aliasNames.sort();
        for (var i = 0; i < $scope.selectedAssessment.aliasNames.length; i++){
            originalSortedAliasNames.push($scope.selectedAssessment.aliasNames[i]);
        }
    }

    var allExistingAssessmentNames= [];
    Restangular.all('assessments').getList().then(
        function(assessments) {
            $scope.assessments = assessments;

            for(var i=0; i < $scope.assessments.length; i++){
                allExistingAssessmentNames.push($scope.assessments[i].assessmentName);
                if($scope.assessments[i].aliasNames != undefined){
                    for(var j=0; j < $scope.assessments[i].aliasNames.length; j++){
                        allExistingAssessmentNames.push($scope.assessments[i].aliasNames[j]);
                    }
                }
            }

            //take out assessment names from 'allExistingAssessmentNames' that are in the selectedAssessment(main and alias names)
            var idx= allExistingAssessmentNames.indexOf(originalAssessmentName);
            allExistingAssessmentNames.splice(idx, 1);
            for(var z= 0; z < originalSortedAliasNames.length; z++){
                idx= allExistingAssessmentNames.indexOf(originalSortedAliasNames[z]);
                allExistingAssessmentNames.splice(idx, 1);
            }

        });


    //alias names
    $scope.aliasNames= $scope.selectedAssessment.aliasNames;
    if($scope.selectedAssessment.aliasNames == undefined)
        $scope.selectedAssessment.aliasNames= [];

    $scope.addAliasNameField= function(){

        var size= $scope.selectedAssessment.aliasNames.length;
        if(size === 0){
            $scope.selectedAssessment.aliasNames[0]= "";
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
                $scope.selectedAssessment.aliasNames[size] = "";
            }
        }

    };

    $scope.deleteAliasNameField= function(e){
        $scope.selectedAssessment.aliasNames.splice(e, 1);
    };

    $scope.cancel= function(){
        $location.path('/admin/assessmentManagement');
    };

    $scope.isDuplicateAssessmentName= false;
    $scope.isDuplicateAliasAssessmentName= false;

    $scope.resetDuplicateAssessmentName= function(){
        $scope.isDuplicateAssessmentName= false;
        $scope.selectedAssessment.assessmentName= originalAssessmentName;
    };

    $scope.save= function(){

        if(originalAssessmentName != $scope.selectedAssessment.assessmentName) {

            for(var i=0; i < allExistingAssessmentNames.length; i++){
                if($scope.selectedAssessment.assessmentName == allExistingAssessmentNames[i]){
                    $scope.isDuplicateAssessmentName= true;
                    break;
                }
            }
        }

        var newAliasNames= [];
        $scope.duplicateAliasNames= [];
        var sortedAliasNames= [];
        if($scope.selectedAssessment.aliasNames != undefined)
            sortedAliasNames= $scope.selectedAssessment.aliasNames.sort();

        if(sortedAliasNames.length > 0 && originalSortedAliasNames.length === 0){

            for(var i=0; i < sortedAliasNames.length; i++) {
                for (var j = 0; j < allExistingAssessmentNames.length; j++) {
                    if (sortedAliasNames[i] == allExistingAssessmentNames[j]) {
                        $scope.duplicateAliasNames.push(sortedAliasNames[i]);
                        $scope.isDuplicateAliasAssessmentName = true;
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
                        for (var j = 0; j < allExistingAssessmentNames.length; j++) {
                            if (sortedAliasNames[k] == allExistingAssessmentNames[j]) {
                                if($scope.duplicateAliasNames.indexOf(sortedAliasNames[k]) == -1){
                                    $scope.duplicateAliasNames.push(sortedAliasNames[k]);
                                }
                                $scope.isDuplicateAliasAssessmentName = true;
                                break;
                            }
                        }
                    }

                }
                else if(originalSortedAliasNames[i] == undefined){

                    for(var k=0; k < sortedAliasNames.length; k++) {
                        for (var j = 0; j < allExistingAssessmentNames.length; j++) {
                            if (sortedAliasNames[k] == allExistingAssessmentNames[j]) {
                                if($scope.duplicateAliasNames.indexOf(sortedAliasNames[k]) == -1){
                                    $scope.duplicateAliasNames.push(sortedAliasNames[k]);
                                }
                                $scope.isDuplicateAliasAssessmentName = true;
                                break;
                            }
                        }
                    }
                }

            }
        }

        $scope.clearDuplicateAliasAssessmentName= function(){
            $scope.duplicateAliasNames= [];
            $scope.isDuplicateAliasAssessmentName= false;
        };

        if(!$scope.isDuplicateAssessmentName
            &&!$scope.isDuplicateAliasAssessmentName){

            //console.log("*** saving: " + JSON.stringify($scope.selectedDisease));

            Restangular.all('assessments/edit').post($scope.selectedAssessment).then(
                function() {
                    $location.path('/admin/assessmentManagement');
                });
        }
    };

}

function AssessmentDetailCtrl(){

}

function AssessmentNewCtrl($scope, Restangular, $location, $http){

    var allExistingAssessmentNames= [];
    Restangular.all('assessments').getList().then(
        function(assessments) {
            $scope.assessments = assessments;

            for(var i=0; i < $scope.assessments.length; i++){
                allExistingAssessmentNames.push($scope.assessments[i].assessmentName);
                if($scope.assessments[i].aliasNames != undefined){
                    for(var j=0; j < $scope.assessments[i].aliasNames.length; j++){
                        allExistingAssessmentNames.push($scope.assessments[i].aliasNames[j]);
                    }
                }
            }
        });


    $scope.isDuplicateAssessmentName= false;
    $scope.isDuplicateAliasAssessmentName= false;

    $scope.resetDuplicateAssessmentName= function(){
        $scope.isDuplicateAssessmentName= false;
    };

    $scope.checkDuplicateAssessmentName= function(assessmentName){

        if(allExistingAssessmentNames.indexOf(assessmentName.toLowerCase()) > -1)
            $scope.isDuplicateAssessmentName= true;
    };



    var duplicateAliasAssessmentNames= [];
    $scope.duplicateAliasAssessmentNames= duplicateAliasAssessmentNames;

    $scope.addAliasAssessmentName= function(index){

        var id= "ans-" + index;
        var aliasNameOfAssessment= document.getElementById(id).value;

        if(allExistingAssessmentNames.indexOf(aliasNameOfAssessment) > -1) {
            if ($scope.duplicateAliasAssessmentNames.indexOf(aliasNameOfAssessment) == -1)
                $scope.duplicateAliasAssessmentNames.push(aliasNameOfAssessment);
        }
    };

    $scope.clearDuplicateAliasAssessmentNames= function(){

        //console.log(" brandNames beginning of clear: " + JSON.stringify($scope.brandNames));
        var nonDuplicateAliasAssessmentNames= [];
        //$scope.dups= [];
        for(var i=0; i<= $scope.aliasNames.length; i++){
            var id= "ans-" + i;
            var aliasNameOfAssessment= document.getElementById(id).value;
            if($scope.duplicateAliasAssessmentNames.indexOf(aliasNameOfAssessment) > -1){
                $scope.aliasNames.splice(i, 1);
            }else{
                nonDuplicateAliasAssessmentNames.push(aliasNameOfAssessment);
            }
        }

        $scope.dups= nonDuplicateAliasAssessmentNames;

        //reset brandNames array to start at zero
        var quantityInAliasNamesArray= $scope.aliasNames.length;
        $scope.aliasNames= [];
        if(nonDuplicateAliasAssessmentNames.length > 0) {
            for (var j = 0; j < quantityInAliasNamesArray; j++) {
                $scope.aliasNames.push(j);
            }
        }

        $scope.showDuplicateAliasAssessmentNames= false;
        $scope.duplicateAliasAssessmentNames= [];
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

        if($scope.duplicateAliasAssessmentNames.length > 0){
            $scope.showDuplicateAliasAssessmentNames= true;
        }else {

            var s = getAssessmentJSONPOST($scope);
            //console.log("*** s: " + JSON.stringify(s));

            Restangular.all('assessments/new').post(s).then(
                function (assessment) {
                    $location.path('/admin/assessmentManagement');
                });

        }

    };

    $scope.cancel= function(){
        $location.path('/admin/assessmentManagement');
    };

}

function getAssessmentJSONPOST($scope){

    var nameOfAssessment= document.getElementById("assessmentName").value;
    var aliasNamesArray= getAliasNames($scope);
    return {"assessmentName":nameOfAssessment.toLowerCase(),
        "aliasNames": aliasNamesArray};
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