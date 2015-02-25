
app.config(function($routeProvider, RestangularProvider) {
    !$routeProvider.

        when('/admin/drugManagement', {
                controller: DrugListCtrl,
                templateUrl: 'frontend/partials/admin/drug-list.html'
        }).

        when('/admin/drugManagement/new', {
                controller: DrugNewCtrl,
                templateUrl: 'frontend/partials/admin/drug-new.html'
        }).

        when('/admin/drugManagement/interactions/detail/:id',{
            controller:DrugInteractionsCtrl,
            templateUrl: 'frontend/partials/admin/drug-interactions.html',
            resolve: {
                drug: function(Restangular, $route){
                    var theRoute= 'drugs/withinteractions/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        }).

        /*
        when('/admin/drugManagement/detail/:id',{
            controller:DrugDetailCtrl,
            templateUrl: 'frontend/partials/client/drug-detail.html',
            resolve: {
                drug: function(Restangular, $route){
                    var theRoute= 'drugs/withinteractions/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
                }
            }
        }).
        */


        /*
        when('/client/drug/detail/:drugName',{
            controller:DrugDetailCtrl,
            templateUrl: 'frontend/partials/client/drug-detail.html',
            resolve: {
                drug: function(Restangular, $route){
                    var theRoute= 'drugs/' + $route.current.params.drugName + '/';
                    return Restangular.one(theRoute).get();
                },
                drugNames: function(Restangular, $route){

                    return Restangular.all('drugs').getList().then(
                        function(drugs) {
                            var drugNames= [];
                            for(var i=0; i < drugs.length; i++){
                                drugNames.push(drugs[i].drugName);
                            }
                            return drugNames;
                        });

                }
            }
        }).
        */

        when('/admin/drugManagement/edit/:id',{
            controller:DrugEditCtrl,
            templateUrl: 'frontend/partials/admin/drug-edit.html',
            resolve: {
                drug: function(Restangular, $route){
                    var theRoute= 'drugs/' + $route.current.params.id + '/';
                    //return Restangular.one(theRoute).get();
                    var s= Restangular.one(theRoute).get();
                    //console.log("*** s drug: " + s);
                    return s;
                }
            }
        }).

        when('/admin/drugManagement/detail/:id',{
            controller:DrugDetailCtrl,
            templateUrl: 'frontend/partials/admin/drug-detail.html',
            resolve: {
                drug: function(Restangular, $route){
                    var theRoute= 'drugs/withinteractions/' + $route.current.params.id + '/';
                    return Restangular.one(theRoute).get();
            }
        }
    })


});

function DrugDetailCtrl($scope, drug){


    $scope.selectedDrug= drug;


}

function DrugInteractionsCtrl($scope, Restangular, $location, drug, $anchorScroll) {

    $scope.selectedDrug= drug;

    var deletedInteractions= [];

    var originalInteractions= [];
    if($scope.selectedDrug.interactions != null)
        originalInteractions= $scope.selectedDrug.interactions;

    var deletedInteractions= [];

    Restangular.all('drugs').getList().then(
        function(drugs) {
            $scope.drugs = drugs;
        });

    $scope.showNewInteractionDrug= false;


    $scope.deleteInteraction= function(idx){

        var theInteraction= {
            id: $scope.selectedDrug.interactions[idx].id,
            drugName: $scope.selectedDrug.interactions[idx].drugName
        };

        $scope.selectedDrug.interactions.splice(idx, 1);
        var inDeletedArray= false;
        for(var i=0; i < deletedInteractions.length; i++){
            if(deletedInteractions[i].drugName === theInteraction.drugName){
                inDeletedArray= true;
                break;
            }
        }
        if(!inDeletedArray)
            deletedInteractions.push(theInteraction);

    };

    $scope.addInteractionDrug= function(obj){

        $scope.modeldisplay= '';
        $scope.showNewInteractionDrug= true;
        var typeAheadDrugName= obj.target.attributes.data.value;

        if($scope.selectedDrug.interactions == null){
            $scope.selectedDrug.interactions= [];
        }

        //see if the drug is in deletedInteractions array, if so, delete it, and add it
        //to the selectedDrug
        var isInDeletedInteractionsArray= false;
        var idxOfItem;
        var existingId= '';
        for(var i=0; i < deletedInteractions.length; i++){
            if(deletedInteractions[i].drugName === typeAheadDrugName){
                isInDeletedInteractionsArray= true;
                idxOfItem= i;
                existingId= deletedInteractions[i].id;
                break;
            }
        }
        if(isInDeletedInteractionsArray){
            deletedInteractions.splice(idxOfItem, 1);
        }

        $scope.selectedDrug.interactions.push({'id': '', 'drugName':'','severityLevel':'','summary':''});

        //$scope.newInteractionDrugName= typeAheadDrugName;

        $scope.size= $scope.selectedDrug.interactions.length;
        $scope.selectedDrug.interactions[$scope.size - 1].drugName= typeAheadDrugName;

        $scope.selectedDrug.interactions[$scope.size - 1].id= existingId;

        $scope.selectedDrug.interactions.reverse();

    };

    $scope.sortByDrugName= function(){

        $scope.selectedDrug.interactions.sort(compareDrugName);
    };

    $scope.missingInteractionInfo= [];

    $scope.clearMissingInterationInfo= function(){
        $scope.missingInteractionInfo= [];
    }

    $scope.save= function(){

        //console.log("*** save...deletedInteractions: " + JSON.stringify(deletedInteractions));
        //console.log("*** save...interactions to save: " + JSON.stringify($scope.selectedDrug.interactions));


        var interactions= $scope.selectedDrug.interactions;
        for(var i=0; i < interactions.length; i++){
            var anInteraction= interactions[i];
            if(anInteraction.severityLevel === '' || anInteraction.summary === ''){
                $scope.missingInteractionInfo.push(anInteraction.drugName);
            }
        }
        if($scope.missingInteractionInfo.length === 0){

            Restangular.all('drugs/saveInteractions').post($scope.selectedDrug).then(
                function(client) {
                    $location.path('/admin/drugManagement/interactions/detail/' + $scope.selectedDrug.id);
                });

            if(deletedInteractions.length > 0){
                var s= {"id":$scope.selectedDrug.id, "interactions": deletedInteractions};
                Restangular.all('drugs/deleteInteractions').post(s).then(
                    function(client) {
                        $location.path('/admin/drugManagement/interactions/detail/' + $scope.selectedDrug.id);

                    });
            }
            $('#fadedMessage').fadeIn('fast').delay(1000).fadeOut('fast');
        }

    }

}

function compareDrugName(a,b) {
    if (a.drugName < b.drugName)
        return -1;
    if (a.drugName > b.drugName)
        return 1;
    return 0;
}


function DrugEditCtrl($scope, $location, Restangular, drug, $filter, $http){

    //console.log("*** drug: " + drug);
    $scope.selectedDrug= drug;

    var originalDrugName= $scope.selectedDrug.drugName;
    var originalSortedBrandNames= [];

    if($scope.selectedDrug.brandNames != undefined) {
        $scope.selectedDrug.brandNames.sort();
        for (var i = 0; i < $scope.selectedDrug.brandNames.length; i++){
            originalSortedBrandNames.push($scope.selectedDrug.brandNames[i]);
        }
    }

    var allExistingDrugNames= [];
    Restangular.all('drugs').getList().then(
        function(drugs) {
            $scope.drugs = drugs;

            for(var i=0; i < $scope.drugs.length; i++){
                allExistingDrugNames.push($scope.drugs[i].drugName);
                if($scope.drugs[i].brandNames != undefined){
                    for(var j=0; j < $scope.drugs[i].brandNames.length; j++){
                        allExistingDrugNames.push($scope.drugs[i].brandNames[j]);
                    }
                }
            }

            //take out drug names from 'allExistingDrugNames' that are in the selectedDrug(generic and brand names)
            var idx= allExistingDrugNames.indexOf(originalDrugName);
            allExistingDrugNames.splice(idx, 1);
            for(var z= 0; z < originalSortedBrandNames.length; z++){
                idx= allExistingDrugNames.indexOf(originalSortedBrandNames[z]);
                allExistingDrugNames.splice(idx, 1);
            }

        });


    //brand names
    $scope.brandNames= $scope.selectedDrug.brandNames;
    if($scope.selectedDrug.brandNames == undefined)
        $scope.selectedDrug.brandNames= [];

    $scope.addBrandNameField= function(){

        var size= $scope.selectedDrug.brandNames.length;
        if(size === 0){
            $scope.selectedDrug.brandNames[0]= "";
        }
        else{
            var addField= true;
            for(var i=0; i < size; i++) {
                var id = "bns-" + i;
                var val = document.getElementById(id).value;
                if(val.length === 0)
                    addField= false;
            }
            if(addField) {
                $scope.selectedDrug.brandNames[size] = "";
            }
        }

    };
    $scope.deleteBrandNameField= function(e){
        $scope.selectedDrug.brandNames.splice(e, 1);
    };

    //adrs
    $scope.adrs= $scope.selectedDrug.adrs;
    if($scope.selectedDrug.adrs == undefined)
        $scope.selectedDrug.adrs= [];

    $scope.addADR= function(){
        var size= $scope.selectedDrug.adrs.length;
        if(size === 0){
            $scope.selectedDrug.adrs[0]= "";
        }
        else{
            var addField= true;
            for(var i=0; i < size; i++) {
                var id = "adrs-" + i;
                var val = document.getElementById(id).value;
                if(val.length === 0)
                    addField= false;
            }
            if(addField) {
                $scope.selectedDrug.adrs[size] = "";
            }
        }

    }
    $scope.deleteADR= function(e){
        $scope.selectedDrug.adrs.splice(e, 1);
    }

    //monitoring parameters
    $scope.monitoringParameters= $scope.selectedDrug.monitoringParameters;
    if($scope.selectedDrug.monitoringParameters == undefined)
        $scope.selectedDrug.monitoringParameters= [];

    $scope.addMonitoringParameter= function(){
        var size= $scope.selectedDrug.monitoringParameters.length;
        if(size === 0){
            $scope.selectedDrug.monitoringParameters[0]= "";
        }
        else{
            var addField= true;
            for(var i=0; i < size; i++) {
                var id = "mps-" + i;
                var val = document.getElementById(id).value;
                if(val.length === 0)
                    addField= false;
            }
            if(addField) {
                $scope.selectedDrug.monitoringParameters[size] = "";
            }
        }

    }
    $scope.deleteMonitoringParameter= function(e){
        $scope.selectedDrug.monitoringParameters.splice(e, 1);
    }

    //dosages
    $scope.dosages= $scope.selectedDrug.dosages;
    if($scope.selectedDrug.dosages == undefined)
        $scope.selectedDrug.dosages= [];

    $scope.addDosage= function(){
        var size= $scope.selectedDrug.dosages.length;
        if(size === 0){
            $scope.selectedDrug.dosages[0]= "";
        }
        else{
            var addField= true;
            for(var i=0; i < size; i++) {
                var id = "dosages-" + i;
                var val = document.getElementById(id).value;
                if(val.length === 0)
                    addField= false;
            }
            if(addField) {
                $scope.selectedDrug.dosages[size] = "";
            }
        }
    };

    $scope.deleteDosage= function(e){
        $scope.selectedDrug.dosages.splice(e, 1);
    };

    $scope.cancel= function(){
        $location.path('/admin/drugManagement');
    };

    $scope.isDuplicateDrugName= false;
    $scope.isDuplicateBrandDrugName= false;

    $scope.resetDuplicateDrugName= function(){
        $scope.isDuplicateDrugName= false;
        $scope.selectedDrug.drugName= originalDrugName;
    };

    $scope.save= function(){

        if(originalDrugName != $scope.selectedDrug.drugName) {

            for(var i=0; i < allExistingDrugNames.length; i++){
                if($scope.selectedDrug.drugName == allExistingDrugNames[i]){
                    $scope.isDuplicateDrugName= true;
                    break;
                }
            }
        }

        var newBrandNames= [];
        $scope.duplicateBrandNames= [];
        var sortedBrandNames= [];
        if($scope.selectedDrug.brandNames != undefined)
            sortedBrandNames= $scope.selectedDrug.brandNames.sort();

        if(sortedBrandNames.length > 0 && originalSortedBrandNames.length === 0){

            for(var i=0; i < sortedBrandNames.length; i++) {
                for (var j = 0; j < allExistingDrugNames.length; j++) {
                    if (sortedBrandNames[i] == allExistingDrugNames[j]) {
                        $scope.duplicateBrandNames.push(sortedBrandNames[i]);
                        $scope.isDuplicateBrandDrugName = true;
                        break;
                    }
                }
            }

        }
        if(sortedBrandNames.length > 0 && originalSortedBrandNames.length > 0){

            for(var i=0; i < sortedBrandNames.length; i++){
                if(originalSortedBrandNames[i] != undefined
                                && (sortedBrandNames[i] != originalSortedBrandNames[i])){


                    for(var k=0; k < sortedBrandNames.length; k++) {
                        for (var j = 0; j < allExistingDrugNames.length; j++) {
                            if (sortedBrandNames[k] == allExistingDrugNames[j]) {
                                if($scope.duplicateBrandNames.indexOf(sortedBrandNames[k]) == -1){
                                    $scope.duplicateBrandNames.push(sortedBrandNames[k]);
                                }
                                $scope.isDuplicateBrandDrugName = true;
                                break;
                            }
                        }
                    }

                }
                else if(originalSortedBrandNames[i] == undefined){

                    for(var k=0; k < sortedBrandNames.length; k++) {
                        for (var j = 0; j < allExistingDrugNames.length; j++) {
                            if (sortedBrandNames[k] == allExistingDrugNames[j]) {
                                if($scope.duplicateBrandNames.indexOf(sortedBrandNames[k]) == -1){
                                    $scope.duplicateBrandNames.push(sortedBrandNames[k]);
                                }
                                $scope.isDuplicateBrandDrugName = true;
                                break;
                            }
                        }
                    }
                }

            }
        }

        $scope.clearDuplicateBrandDrugName= function(){
            $scope.duplicateBrandNames= [];
            $scope.isDuplicateBrandDrugName= false;
        };

        if(!$scope.isDuplicateDrugName
            &&!$scope.isDuplicateBrandDrugName){

            //console.log("*** saving: " + $scope.selectedDrug);

             Restangular.all('drugs/edit').post($scope.selectedDrug).then(
                function(client) {
                    $location.path('/admin/drugManagement');
             });

        }

    };

    $scope.delete= function(){

        Restangular.one('drugs/' + $scope.selectedDrug.id + "/").remove().then(
            function() {
                $location.path('/admin/drugManagement');
            });
    };

}

function DrugListCtrl($scope, Restangular, printingService) {

    Restangular.all('drugs').getList().then(
        function(drugs) {
            $scope.drugs = drugs;
        });

    $scope.listBrandNames= function(brandNames){
        return printingService.listArray(brandNames);
    };
}

function DrugNewCtrl($scope, Restangular, $location, $http, $q, $anchorScroll) {


    var allExistingDrugNames= [];
    Restangular.all('drugs').getList().then(
        function(drugs) {
            $scope.drugs = drugs;

            for(var i=0; i < $scope.drugs.length; i++){
                allExistingDrugNames.push($scope.drugs[i].drugName);
                if($scope.drugs[i].brandNames != undefined){
                    for(var j=0; j < $scope.drugs[i].brandNames.length; j++){
                        allExistingDrugNames.push($scope.drugs[i].brandNames[j]);
                    }
                }
            }
        });




    $scope.isDuplicateDrugName= false;
    $scope.isDuplicateBrandDrugName= false;

    $scope.showDuplicateBrandDrugNames= false;

    $scope.resetDuplicateDrugName= function(){
        $scope.isDuplicateDrugName= false;
    };

    $scope.resetDuplicateBrandDrugName= function(index){

        var id= "bns-" + index;
        var brandNameOfDrug= document.getElementById(id).value= "";
        $scope.isDuplicateBrandDrugName= false;
    }

    $scope.checkDuplicateBrandDrugName= function(index){

        var id= "bns-" + index;
        var brandNameOfDrug= document.getElementById(id).value;

        /*
        var responsePromise= $http.get("/rest/v1/drugs/" + brandNameOfDrug + "/");
        responsePromise.success(function(data, status, headers, config) {

            if(data.drugName.length > 0)
                $scope.isDuplicateBrandDrugName= true;
        });
        */

        if(allExistingDrugNames.indexOf(brandNameOfDrug.toLowerCase()) > -1)
            $scope.isDuplicateBrandDrugName= true;

    }

    $scope.checkDuplicateDrugName= function(drugName){

        /*
        var responsePromise= $http.get("/rest/v1/drugs/" + drugName + "/");
        responsePromise.success(function(data, status, headers, config) {

            if(data.drugName.length > 0)
                $scope.isDuplicateDrugName= true;
        });
        */
        if(allExistingDrugNames.indexOf(drugName.toLowerCase()) > -1)
            $scope.isDuplicateDrugName= true;
    };

    var duplicateBrandDrugNames= [];
    $scope.duplicateBrandDrugNames= duplicateBrandDrugNames;

    $scope.addBrandDrugName= function(index){

        var id= "bns-" + index;
        var brandNameOfDrug= document.getElementById(id).value;

        if(allExistingDrugNames.indexOf(brandNameOfDrug) > -1) {
            if ($scope.duplicateBrandDrugNames.indexOf(brandNameOfDrug) == -1)
                $scope.duplicateBrandDrugNames.push(brandNameOfDrug);
        }

        /*
        var responsePromise= $http.get("/rest/v1/drugs/" + brandNameOfDrug + "/");
        responsePromise.success(function(data, status, headers, config) {
            if((typeof data.drugName != 'undefined') && data.drugName.length > 0) {
                if($scope.duplicateBrandDrugNames.indexOf(brandNameOfDrug) == -1)
                    $scope.duplicateBrandDrugNames.push(brandNameOfDrug);
            }
        });
        */
    };

    $scope.clearDuplicateBrandDrugNames= function(){

        //console.log(" brandNames beginning of clear: " + JSON.stringify($scope.brandNames));
        var nonDuplicateBrandDrugNames= [];
        //$scope.dups= [];
        for(var i=0; i<= $scope.brandNames.length; i++){
            var id= "bns-" + i;
            var brandNameOfDrug= document.getElementById(id).value;
            if($scope.duplicateBrandDrugNames.indexOf(brandNameOfDrug) > -1){
                $scope.brandNames.splice(i, 1);
            }else{
                nonDuplicateBrandDrugNames.push(brandNameOfDrug);
            }
        }

        $scope.dups= nonDuplicateBrandDrugNames;

        //reset brandNames array to start at zero
        var quantityInBrandNamesArray= $scope.brandNames.length;
        $scope.brandNames= [];
        if(nonDuplicateBrandDrugNames.length > 0) {
            for (var j = 0; j < quantityInBrandNamesArray; j++) {
                $scope.brandNames.push(j);
            }
        }

        $scope.showDuplicateBrandDrugNames= false;
        $scope.duplicateBrandDrugNames= [];
    };

    //dosages
    var dosages= [];
    $scope.dosages= dosages;
    $scope.addDosage= function(){
        var size= $scope.dosages.length;
        $scope.dosages.push(size + 1);
    }
    $scope.deleteDosage= function(e){
        $scope.dosages.splice(e, 1);
    }

    //brand names
    var brandNames= [];
    $scope.brandNames= brandNames;
    $scope.addBrandNameField= function(){
        var size= $scope.brandNames.length;
        $scope.brandNames.push(size + 1);
    };
    $scope.deleteBrandNameField= function(e){
        $scope.brandNames.splice(e, 1);
    };

    //adrs
    var adrs= [];
    $scope.adrs= adrs;
    $scope.addADR= function(){
        var size= $scope.adrs.length;
        $scope.adrs.push(size + 1);
    }
    $scope.deleteADR= function(e){
        $scope.adrs.splice(e, 1);
    }

    //monitoring parameters
    var monitoringParameters= [];
    $scope.monitoringParameters= monitoringParameters;
    $scope.addMonitoringParameter= function(){
        var size= $scope.monitoringParameters.length;
        $scope.monitoringParameters.push(size + 1);
    }
    $scope.deleteMonitoringParameter= function(e){
        $scope.monitoringParameters.splice(e, 1);
    }

    $scope.cancel= function(){
        $location.path('/admin/drugManagement');
    };

    $scope.drugs= [];

    Restangular.all('drugs').getList().then(
        function(drugs) {
            $scope.drugs = drugs;
        });

    $scope.drugInteractionCheckboxClick= function($event){

        var checkbox = $event.target;
        if(!checkbox.checked){
            var id= checkbox.id;
            document.getElementById('severityLevel-' + id).value= '';
            document.getElementById('summary-' + id).value= '';
        }
    }

    $scope.save= function(){

        if($scope.duplicateBrandDrugNames.length > 0){
            $scope.showDuplicateBrandDrugNames= true;
        }else {

            var s = getDrugJSONPOST($scope);
            //console.log("*** s: " + JSON.stringify(s));

            Restangular.all('drugs/new').post(s).then(
                function (drug) {
                    $location.path('/admin/drugManagement');
                });
        }

    };

    $scope.scrollTo= function(obj){

        var id= obj.target.attributes.data.value

        var baseLen = $location.absUrl().length - $location.url().length;
        var newURL= $location.absUrl().substring(0, baseLen);
        newURL += '/new#' + id;

        $scope.modeldisplay= "";

        //$location changes '#' to %23, and that does not work for this
        window.location.assign(newURL);
    }

}

function getDrugJSONPOST($scope){

    var nameOfDrug= document.getElementById("drugName").value;
    var brandNamesArray= getBrandNames($scope);
    var adrsArray= getADRs($scope);
    var monitoringParametersArray= getMonitoringParameters($scope);
    var dosagesArray= getDosages($scope);
    var interactionsArray= getInteractions($scope);
    return {"drugName":nameOfDrug.toLowerCase(),
        "brandNames": brandNamesArray,
        "adrs":adrsArray,
        "monitoringParameters": monitoringParametersArray,
        "dosages": dosagesArray,
        "interactions": interactionsArray};
}

function getInteractions($scope){

    var drugsArray= [];
    var inputElements = document.getElementsByClassName('drugCheckbox');
    for(var i=0; inputElements[i]; ++i){
        if(inputElements[i].checked){
            checkedValue = inputElements[i].value;

            var severityLevelId= "severityLevel-" + checkedValue;
            var severityLevelElement= document.getElementById(severityLevelId);
            var severityLevelValue= severityLevelElement.options[severityLevelElement.selectedIndex].value;

            var summaryId= "summary-" + checkedValue;
            var summaryValue= document.getElementById(summaryId).value;

            var internalArray= [];
            internalArray.push(checkedValue);
            internalArray.push(severityLevelValue);
            internalArray.push(summaryValue);

            drugsArray.push(internalArray);
        }
    }
    return drugsArray;
}

function getBrandNames($scope){

    var brandNamesArray= [];
    for(var i=0; i< $scope.brandNames.length; i++){
        var id= "bns-" + i
        var el= document.getElementById(id);
        brandNamesArray.push(el.value.toLowerCase());
    }
    return brandNamesArray;
}

function getADRs($scope){

    var adrsArray= [];
    for(var i=0; i< $scope.adrs.length; i++){
        var id= "adrs-" + i
        var el= document.getElementById(id);
        adrsArray.push(el.value.toLowerCase());
    }
    return adrsArray;
}

function getMonitoringParameters($scope){

    var monitoringParametersArray= [];
    for(var i=0; i< $scope.monitoringParameters.length; i++){
        var id= "mps-" + i
        var el= document.getElementById(id);
        monitoringParametersArray.push(el.value.toLowerCase());
    }
    return monitoringParametersArray;
}

function getDosages($scope){

    var dosagesArray= [];
    for(var i=0; i< $scope.dosages.length; i++){
        var id= "dosages-" + i
        var el= document.getElementById(id);
        dosagesArray.push(el.value.toLowerCase());
    }
    return dosagesArray;
}

function drugNameExists($http, drugName){

    var responsePromise= $http.get("/rest/v1/drugs/" + drugName + "/");
    return responsePromise;
    /*
     responsePromise.success(function(data, status, headers, config) {
     if(data.drugName.length > 0)
     return true;
     else
     return false;
     });
     */
}