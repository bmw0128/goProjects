var app= angular.module('project', ['mm.foundation', 'restangular', 'ngRoute', 'multi-select']);

    app.config(function($routeProvider, RestangularProvider) {
        $routeProvider.
            when('/', {
                controller:EntryCtrl,
                templateUrl:'frontend/partials/entry.html'
            }).
            when('/admin/clientManagement', {
                controller:ClientListCtrl,
                templateUrl:'frontend/partials/admin/client-list.html'
            }).
            when('/admin/clientManagement/new', {
                controller:ClientNewCtrl,
                templateUrl:'frontend/partials/admin/client-new.html'
            }).
            when('/admin/clientManagement/edit/:clientEmail', {
                controller:ClientEditCtrl,
                templateUrl:'frontend/partials/admin/client-detail.html',
                resolve: {
                    client: function(Restangular, $route){
                        var theRoute= 'clients/' + $route.current.params.clientEmail + '/';
                        return Restangular.one(theRoute).get();

                        //Restangular.one(theRoute).get().then(
                        //    function(client) {
                        //        return client;
                        //        //console.log("*** in resolve, client email: " + JSON.stringify(client))
                        //    });

                        }
                }
            }).
            when('/edit/:projectId', {
                controller:EditCtrl,
                templateUrl:'frontend/partials/admin/drug-detail.html',
                resolve: {
                    project: function(Restangular, $route){
                        return Restangular.one('projects', $route.current.params.projectId).get();
                    }
                }
            }).
            when('/new', {
                controller:CreateCtrl,
                templateUrl:'frontend/partials/admin/drug-detail.html'
            }).
            when('/noAccess', {

                templateUrl:'frontend/partials/noAccess.html'
            }).
            otherwise({redirectTo:'/'});

        RestangularProvider.setBaseUrl('/rest/v1');

        //RestangularProvider.setBaseUrl('https://api.mongolab.com/api/1/databases/angularjs/collections');
        //RestangularProvider.setDefaultRequestParams({ apiKey: '4f847ad3e4b08a2eed5f3b54' })
        //RestangularProvider.setRestangularFields({id: '_id.$oid'});

        RestangularProvider.setRequestInterceptor(function(elem, operation, what) {

            if (operation === 'put') {
                elem._id = undefined;
                return elem;
            }
            return elem;
        })
    });


