app.service('printingService', [function() {

    return {
        listArray: function(theArray) {
            var result= "{";
            result += theArray.join(", ");
            result += "}";
            return result;
        }
    };
}]);