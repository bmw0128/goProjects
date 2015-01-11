app.directive('disease-assessments', function($compile){

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