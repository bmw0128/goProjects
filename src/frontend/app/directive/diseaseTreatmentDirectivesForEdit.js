app.directive('patientgroupSearchTypeaheadForEdit', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.da= function(txt){

                //set up to remove the patient group names that are taken already
                var patientGroupsInUse= [];
                if(scope.patientGroupingCombo.patientGroups != null){
                    for(var i=0; i < scope.patientGroupingCombo.patientGroups.length; i++)
                        patientGroupsInUse.push(scope.patientGroupingCombo.patientGroups[i].patientGroupName);
                }

                scope.$watch('patientGroups', function(newValue, oldValue) {
                    var patientGroupNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var patientGroupName= newValue[i].patientGroupName;
                        //this checks if the patientGroupName is already in use
                        if(patientGroupsInUse.indexOf(patientGroupName) == -1)
                            patientGroupNames.push(patientGroupName);
                    }

                    if(patientGroupNames.length > 0) {

                        for(var j= 0; j< patientGroupNames.length; j++){
                            if(patientGroupNames[j].startsWith(txt.toLowerCase())){
                                result.push(patientGroupNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadData= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplay" ng-change="da(modeldisplay)" '
        + 'class="search-query" placeholder="Search for a Patient Group to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplay.length || selected" style="width:100%">'

        + '<a ng-click="addPatientGroup($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadData" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});