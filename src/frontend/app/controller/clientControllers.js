
/*
 This is needed for Foundaion's OffCavas to work
 */
var OffCanvasCtrl = function ($scope, Restangular) {

    $scope.isClient= false;
    $scope.isAdmin= false;
    Restangular.one('clients/role').get().then(
        function(roles) {
            $scope.isAdmin= roles.indexOf('admin') > -1;
            //$scope.isAdmin= true;
            $scope.isClient= roles.indexOf('client') > -1;
        });
};

function ClientNewCtrl($scope, Restangular, $location) {

    Restangular.one('clients/role').get().then(
        function(roles) {
            $scope.roles = roles;
        });

    //$scope.roleOptions= [{name:'admin'},{name:'doctor'},{name:'student'}];
    $scope.roleOptions= [{name:'admin'},{name:'client'}];

    $scope.save= function(){
        Restangular.all('clients/new').post($scope.client).then(
            function(client) {
                $location.path('/admin/clientManagement');
            });
    }

    $scope.cancel= function(){
        $location.path('/admin/clientManagement');
    }
}

function EntryCtrl($scope, Restangular){


}

function ClientListCtrl($scope, Restangular, $location) {

    /*
     var clientArray= [];
     Restangular.all('clients').getList().then(
     function(client) {
     for (var i = 0; i < client.length; i++) {
     clientArray[clientArray.length]= client[i];
     }
     $scope.clients= clientArray;
     }
     );
     */

    Restangular.one('clients/role').get().then(
        function(roles) {
            $scope.roles = roles;
        });

    Restangular.all('clients').getList().then(
        function(clients) {
            $scope.clients = clients;
        });

}

function ListCtrl($scope, Restangular) {
    $scope.drugs = Restangular.all("drugs").getList().$object;
}

function CreateCtrl($scope, $location, Restangular) {

    $scope.save = function() {
        Restangular.all('drugs/').post($scope.drug).then(function(project) {
            $location.path('/list');
        });
    }
}

function ClientEditCtrl($scope, $location, Restangular, client){

    $scope.roleOptions= [{name:'admin'},{name:'doctor'},{name:'student'}]

    Restangular.one('clients/role').get().then(
        function(roles) {
            $scope.roles = roles;
        });

    var original = client;
    $scope.client = Restangular.copy(original);

    /*
     $scope.destroy = function() {
     original.remove().then(function() {
     $location.path('/admin/clientManagement');
     });
     };
     */
}

function EditCtrl($scope, $location, Restangular, project) {

    var original = project;
    $scope.project = Restangular.copy(original);

    $scope.isClean = function() {
        return angular.equals(original, $scope.project);
    }

    $scope.destroy = function() {
        original.remove().then(function() {
            $location.path('/list');
        });
    };

    $scope.save = function() {
        $scope.project.put().then(function() {
            $location.path('/');
        });
    };
}
