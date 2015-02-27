app.config(function($routeProvider, RestangularProvider) {
    !$routeProvider.

        when('/admin/patientGroupManagement', {
            controller: PatientGroupsCtrl,
            templateUrl: 'frontend/partials/admin/patientGroup-list.html'

        }).

        when('/admin/patientGroup/new', {
            controller: PatientGroupNewCtrl,
            templateUrl: 'frontend/partials/admin/patientGroup-new.html'

        });
});

function PatientGroupsCtrl($scope, Restangular) {

    Restangular.all('patientGroups').getList().then(
        function(patientGroups) {
            $scope.patientGroups = patientGroups;
        });

};

function PatientGroupNewCtrl($scope, Restangular, $location, $http, $q) {

    Restangular.all('assessments').getList().then(
        function(assessments) {
            $scope.assessments = assessments;
            //console.log(JSON.stringify($scope.diseases));
        });

    var allExistingPatientGroupNames= [];
    Restangular.all('patientGroups').getList().then(
        function(patientGroups) {
            $scope.patientGroups = patientGroups;

            for(var i=0; i < $scope.patientGroups.length; i++){
                allExistingPatientGroupNames.push($scope.patientGroups[i].patientGroupName.toLowerCase());
            }
        });
    /*
    $scope.hasRangeError= false;
    $scope.rangeCheck= function(idx){

        var inputFieldId= "#in-" + idx;
        var rangeErrorDivId= "#rangeError-" + idx;
        var selectElementId= "#sel-" + idx;
        var inputFieldValue= $(inputFieldId).val();
        var selectedOptionValue= $(selectElementId).val();
        if('range' === selectedOptionValue
                    && inputFieldValue.indexOf('-') === -1){
            $(rangeErrorDivId).css('display','inline');
            $scope.hasRangeError= true;
        }
        else{
            $(rangeErrorDivId).css('display','none');
            $scope.hasRangeError= false;
        }
    };

    $scope.clearRangeError= function(idx){

        var rangeErrorDivId= "#rangeError-" + idx;
        $(rangeErrorDivId).css('display','none');
        $scope.hasRangeError= false;
    };
    */

    $scope.isDuplicatePatientGroupName= false;

    $scope.resetDuplicatePatientGroupName= function(){
        $scope.isDuplicatePatientGroupName= false;
    };

    $scope.checkDuplicatePatientGroupName= function(patientGroupName){

        if(allExistingPatientGroupNames.indexOf(patientGroupName.toLowerCase()) > -1)
            $scope.isDuplicatePatientGroupName= true;
    };


    $scope.hasRangeError= false;
    $scope.hasNumberInputError= false;

    $scope.save= function(){

        $scope.hasRangeError= false;
        $scope.hasNumberInputError= false;

        if(!rangeCheckOk($scope)){
            $scope.hasRangeError= true;
        }
        if(!inputNumberCheckOk($scope)){
            $scope.hasNumberInputError= true;
        }
        if(!$scope.hasRangeError && !$scope.hasNumberInputError) {

            var s = getPatientGroupJSONPOST($scope);
            console.log("*** PG POST: " + JSON.stringify(s));
            /*
            Restangular.all('patientGroups/new').post(s).then(
                function (patientGroup) {
                    $location.path('/admin/patientGroupManagement');
                });
            */
        }

    };

    $scope.cancel= function(){
        $location.path('/admin/patientGroupManagement');
    };

};

function inputNumberCheckOk($scope){

    var size= $scope.assessments.length;
    for(var i=0; i < size; i++){
        //var assessmentId= "ass-" + i;
        var cbId= "cb-" + i;
        var selId= "sel-" + i;
        var inId= "in-" + i;
        if(document.getElementById(cbId).checked){
            //var assessmentIdVal= document.getElementById(assessmentId).value;
            var operatorVal= document.getElementById(selId).value;
            var inputValue= document.getElementById(inId).value;

            if('range' != operatorVal && 'na' != operatorVal){

                if(!/^\d+\.?\d{0,2}$/.test(inputValue)){
                   return false;
                }
            }
        }
    }
    return true;
}

function rangeCheckOk($scope){

    var size= $scope.assessments.length;
    for(var i=0; i < size; i++){
        //var assessmentId= "ass-" + i;
        var cbId= "cb-" + i;
        var selId= "sel-" + i;
        var inId= "in-" + i;
        if(document.getElementById(cbId).checked){
            //var assessmentIdVal= document.getElementById(assessmentId).value;
            var operatorVal= document.getElementById(selId).value;
            var inputValue= document.getElementById(inId).value;

            if('range' === operatorVal){
                if(inputValue.indexOf('-') === -1){
                    return false;
                }else{
                    var idx= inputValue.indexOf('-');
                    var min= inputValue.substring(0, idx);
                    var max= inputValue.substring(idx+1);
                    var minChk= /^\d+\.?\d{0,2}$/.test(min);
                    var maxChk= /^\d+\.?\d{0,2}$/.test(max);
                    //return Number(min) < Number(max);
                    if(Number(min) > Number(max)){
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

function getPatientGroupJSONPOST($scope){

    var nameOfPatientGroup= document.getElementById("patientGroupName").value;
    var assessmentMap= getPatientGroupAssessmentMap($scope);
    return {"patientGroupName":nameOfPatientGroup.toLowerCase(),
        "assessments": assessmentMap};
}

function getPatientGroupAssessmentMap($scope){
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