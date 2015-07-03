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

app.directive('txDrugSearchTypeaheadPrimaryGroupA', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.daA= function(txt){

                //set up to remove the drug names that are taken already
                /*
                var drugNamesInUse= [];
                drugNamesInUse.push(scope.selectedDrug.drugName);
                if(scope.selectedDrug.interactions != null){
                    for(var i=0; i < scope.selectedDrug.interactions.length; i++)
                        drugNamesInUse.push(scope.selectedDrug.interactions[i].drugName);
                }
                */

                scope.$watch('drugsPrimaryGroupA', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        //this checks if the drugName is in use already
                        //if(drugNamesInUse.indexOf(drugName) == -1)
                            drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {
                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadDataA= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplayA" ng-change="daA(modeldisplayA)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplayA.length || selected" style="width:100%">'

        + '<a ng-click="addDrugPrimaryGroupA($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadDataA" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});

app.directive('txDrugSearchTypeaheadPrimaryGroupB', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.daB= function(txt){

                //set up to remove the drug names that are taken already
                /*
                 var drugNamesInUse= [];
                 drugNamesInUse.push(scope.selectedDrug.drugName);
                 if(scope.selectedDrug.interactions != null){
                 for(var i=0; i < scope.selectedDrug.interactions.length; i++)
                 drugNamesInUse.push(scope.selectedDrug.interactions[i].drugName);
                 }
                 */

                scope.$watch('drugsPrimaryGroupB', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        //this checks if the drugName is in use already
                        //if(drugNamesInUse.indexOf(drugName) == -1)
                        drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {
                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadDataB= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplayB" ng-change="daB(modeldisplayB)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplayB.length || selected" style="width:100%">'

        + '<a ng-click="addDrugPrimaryGroupB($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadDataB" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});

app.directive('txDrugSearchTypeaheadPrimaryGroupC', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.daC= function(txt){

                //set up to remove the drug names that are taken already
                /*
                 var drugNamesInUse= [];
                 drugNamesInUse.push(scope.selectedDrug.drugName);
                 if(scope.selectedDrug.interactions != null){
                 for(var i=0; i < scope.selectedDrug.interactions.length; i++)
                 drugNamesInUse.push(scope.selectedDrug.interactions[i].drugName);
                 }
                 */

                scope.$watch('drugsPrimaryGroupC', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        //this checks if the drugName is in use already
                        //if(drugNamesInUse.indexOf(drugName) == -1)
                        drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {
                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadDataC= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplayC" ng-change="daC(modeldisplayC)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplayC.length || selected" style="width:100%">'

        + '<a ng-click="addDrugPrimaryGroupC($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadDataC" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});
//end Primary Drugs

//Secondary Drugs
app.directive('txDrugSearchTypeaheadSecondaryGroupA', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.dSecA= function(txt){

                scope.$watch('drugsSecondaryGroupA', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {
                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadDataSecondaryA= result;
                    }
                });
            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplaySecA" ng-change="dSecA(modeldisplaySecA)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplaySecA.length || selected" style="width:100%">'

        + '<a ng-click="addDrugSecondaryGroupA($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadDataSecondaryA" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});

app.directive('txDrugSearchTypeaheadSecondaryGroupB', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.dSecB= function(txt){

                scope.$watch('drugsSecondaryGroupB', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {
                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadDataSecondaryB= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplaySecB" ng-change="dSecB(modeldisplaySecB)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplaySecB.length || selected" style="width:100%">'

        + '<a ng-click="addDrugSecondaryGroupB($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadDataSecondaryB" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});

app.directive('txDrugSearchTypeaheadSecondaryGroupC', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.dSecC= function(txt){

                scope.$watch('drugsSecondaryGroupC', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {
                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadDataSecondaryC= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplaySecC" ng-change="dSecC(modeldisplaySecC)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplaySecC.length || selected" style="width:100%">'

        + '<a ng-click="addDrugSecondaryGroupC($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadDataSecondaryC" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});
//end Secondary Drugs

//Tertiary Drugs
app.directive('txDrugSearchTypeaheadTertiaryGroupA', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.dTerA= function(txt){

                scope.$watch('drugsTertiaryGroupA', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {
                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadDataTertiaryA= result;
                    }
                });
            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplayTerA" ng-change="dTerA(modeldisplayTerA)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplayTerA.length || selected" style="width:100%">'

        + '<a ng-click="addDrugTertiaryGroupA($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadDataTertiaryA" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});

app.directive('txDrugSearchTypeaheadTertiaryGroupB', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.dTerB= function(txt){

                scope.$watch('drugsTertiaryGroupB', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {
                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadDataTertiaryB= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplayTerB" ng-change="dTerB(modeldisplayTerB)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplayTerB.length || selected" style="width:100%">'

        + '<a ng-click="addDrugTertiaryGroupB($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadDataTertiaryB" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});

app.directive('txDrugSearchTypeaheadTertiaryGroupC', function(){

    return{
        restrict: 'AEC',

        link: function(scope, elem, attr){

            scope.dTerC= function(txt){

                scope.$watch('drugsTertiaryGroupC', function(newValue, oldValue) {
                    var drugNames = [];
                    var errorVars = {};
                    var result= [];
                    for (var i = 0; i < newValue.length; i++) {
                        var drugName= newValue[i].drugName;
                        drugNames.push(drugName);
                    }

                    if(drugNames.length > 0) {
                        for(var j= 0; j< drugNames.length; j++){
                            if(drugNames[j].startsWith(txt.toLowerCase())){
                                result.push(drugNames[j]);
                            }
                        }
                        result.sort();
                        scope.TypeAheadDataTertiaryC= result;
                    }
                });

            }

        },
        template: '<div id="interactionDrugSearchContainer"><input type="text" ng-model="modeldisplayTerC" ng-change="dTerC(modeldisplayTerC)" '
        + 'class="search-query" placeholder="Search for a drug to add...">'

        + '<div class="typeaheadResultsDiv" '
        + ' ng-hide="!modeldisplayTerC.length || selected" style="width:100%">'

        + '<a ng-click="addDrugTertiaryGroupC($event)" data="{{item}}" '
        + ' ng-repeat="item in TypeAheadDataTertiaryC" '

        + '>'

        + ' {{item}}<br />'
        + '</a> '
        + '</div>'

        + '</input>'

        + '</div>'
    }
});
//end Tertiary Drugs

