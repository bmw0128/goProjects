app.directive('diseaseSearchTypeahead', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.da= function(txt){

                //set up to remove the drug names that are taken already
                var diseaseNamesInUse= [];
                //diseaseNamesInUse.push(scope.selectedDrug.drugName);
                if(scope.patient.diseases != null){
                    for(var i=0; i < scope.patient.diseases.length; i++)
                        diseaseNamesInUse.push(scope.patient.diseases[i].diseaseName);
                }

                scope.$watch('diseases', function(newValue, oldValue) {
                    var diseaseNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var diseaseName= newValue[i].diseaseName;
                        //this checks if the drugName is in use already
                        if(diseaseNamesInUse.indexOf(diseaseName) == -1)
                            diseaseNames.push(diseaseName);
                    }

                    if(diseaseNames.length > 0) {

                        for(var j= 0; j< diseaseNames.length; j++){
                            if(diseaseNames[j].startsWith(txt.toLowerCase())){
                                result.push(diseaseNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadData= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplay" ng-change="da(modeldisplay)" '
        + 'class="search-query" placeholder="Search for a disease to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplay.length || selected" style="width:100%">'

        + '<a ng-click="addDisease($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadData" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});