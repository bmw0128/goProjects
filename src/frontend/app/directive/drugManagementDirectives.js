app.directive('interactionDrugs', function($compile){

    return {
        replace : false,
        restrict: 'A',
        scope: false,
        link: function($scope, $element, $attrs) {

            $scope.$watch('drugs', function(newValue, oldValue) {
                var drugNames= [];
                var errorVars= {};
                for(var i=0; i< newValue.length; i++){
                    drugNames.push(newValue[i].drugName);
                }

                if(drugNames.length > 0) {
                    replaceElement($scope, $element, $compile, drugNames.sort());
                }
            });
        }
    }
});

function replaceElement($scope, $element, $compile, drugNames){

    var html=  "\<div class='row'>"
        + "\<div class='small-12 columns'>"
        + "\<label>Interactions</label>";

    for(var i=0; i < drugNames.length; i++){

        html += "\<div>";

        //html += "<H2 id='" + drugNames[i] + "'></H2>";

        html += "<input id='" + drugNames[i] + "' ";
        html += " class='drugCheckbox' name='" + drugNames[i] + "' ";
        html += " type='checkbox' value='" + drugNames[i] + "' ";
        html += " ng-model='" + drugNames[i] + "' ";
        html += " ng-click='drugInteractionCheckboxClick($event)' ";
        html += " validate-interaction-drug-checkbox/>";
        html += drugNames[i];

        html += "<span class='error' ";
        html += " ng-show='myForm." + drugNames[i];
        html += ".\$error.missingInfo";
        html += "' ";
        html +=  "\>Need Severity Level &/or Summary</span>";

        html +=  "<select name='severityLevel-" + drugNames[i] + "' ";
        html +=  " id='severityLevel-" + drugNames[i] + "' ";
        html += " ng-model='" + drugNames[i] + ".severitylevel' ";
        html +=  " validate-interaction-drug-severity-level ";
        html += ">";
        html +=  "\<option value=''>Severity Level</option>";
        html +=  "\<option value='B'>B</option>";
        html +=  "\<option value='C'>C</option>";
        html +=  "\<option value='D'>D</option>";
        html +=  "\<option value='X'>X</option>";
        html +=  "\</select>";

        html += "<input type='text' ";
        html += " name='summary-" + drugNames[i] +"' ";
        html += " id='summary-" + drugNames[i] + "' ";
        html += " ng-model='" + drugNames[i] + ".summary' ";
        html += " placeholder='Summary' "
        html += " validate-interaction-drug-summary ";
        html += ">";
        html += "\</div>";

    }
    html += "\</div></div>";

    var dom= angular.element(html);
    $element.append(dom);
    $compile(dom)($scope);
}

app.directive('validateInteractionDrugCheckbox', function(){
    return{
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {

            ctrl.$parsers.unshift(function (viewValue) {
                var id= attr.id;
                if(viewValue) {
                    var summaryValue= document.getElementById('summary-' + id).value;
                    var severityLevelValue= document.getElementById('severityLevel-' + id).value;
                    if(summaryValue.length == 0 || severityLevelValue.length == 0) {
                        ctrl.$setValidity("missingInfo", false);
                        return undefined;
                    }
                    else {
                        ctrl.$setValidity("missingInfo", true);
                        return viewValue;
                    }
                }
                else{
                    ctrl.$setValidity("missingInfo", true);
                }
            });
        }
    }
});

app.directive('validateInteractionDrugSeverityLevel', function(){
    return{
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {

            ctrl.$parsers.unshift(function (viewValue) {
                var id= attr.id;
                var x= id.indexOf("-");
                //the drug name is the id of the checkbox
                var theDrugName= id.substring(x+1);
                if(viewValue.length > 0) {
                    var drugCheckbox= document.getElementById(theDrugName);
                    if(drugCheckbox.checked){

                        var summaryValue= document.getElementById('summary-' + theDrugName).value;
                        if(summaryValue.length > 0) {
                            scope.myForm[theDrugName].$setValidity("missingInfo", true);
                        }else{
                            scope.myForm[theDrugName].$setValidity("missingInfo", false);
                        }
                    }
                }
            });
        }
    }
});

app.directive('validateInteractionDrugSummary', function(){
    return{
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, elem, attr, ctrl) {

            ctrl.$parsers.unshift(function (viewValue) {
                var id= attr.id;
                var x= id.indexOf("-");
                var theDrugName= id.substring(x+1);
                if(viewValue.length > 0) {
                    var drugCheckbox= document.getElementById(theDrugName);
                    if(drugCheckbox.checked){
                        var severityLevelValue= document.getElementById('severityLevel-' + theDrugName).value;
                        if(severityLevelValue.length > 0) {
                            scope.myForm[theDrugName].$setValidity("missingInfo", true);
                        }else{
                            scope.myForm[theDrugName].$setValidity("missingInfo", false);
                        }
                    }
                }
            });
        }
    }
});

if(typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function(str) {
        if(str != undefined)
            return this.substring(0, str.length) === str;
        else
            return false;
    }
};

app.directive('interactionDrugSearchTypeahead', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.da= function(txt){

                //set up to remove the drug names that are taken already
                var drugNamesInUse= [];
                drugNamesInUse.push(scope.selectedDrug.drugName);
                if(scope.selectedDrug.interactions != null){
                    for(var i=0; i < scope.selectedDrug.interactions.length; i++)
                        drugNamesInUse.push(scope.selectedDrug.interactions[i].drugName);
                }

                scope.$watch('drugs', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        //this checks if the drugName is in use already
                        if(drugNamesInUse.indexOf(drugName) == -1)
                            drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {

                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadData= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplay" ng-change="da(modeldisplay)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplay.length || selected" style="width:100%">'

        + '<a ng-click="addInteractionDrug($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadData" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});