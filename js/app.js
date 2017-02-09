var scrumApp = angular.module(
    'scrumApp', [
        'ui.router', 'ngMaterial', 'ngMessages', 'angularUtils.directives.dirPagination',
        'scrumApp.scrum'
])

.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/scrum');

    $stateProvider
        .state('home', {
            url: '/home', //having this will show up the url in the address bar
            templateUrl: "templates/home.html",
            controller: "homeCtrl"
        })
        .state('addProject', {
            //url: '/addProject',
            template: 'Coming Soon'
        })
        .state('commonpage', {
            //url: '/commonpage',
            templateUrl: 'templates/commonpage.html'
        })
        .state('secretpage', {
            //url: '/secretpage',
            templateUrl: "templates/secretpage.html",
            resolve: {
                "checkthis": function (accessFac) { //function to be resolved, accessFac Injected
                    if (accessFac.checkPermission()) { //check if the user has permission -- This happens before the page loads

                    } else {
                        alert("You don't have access here");
                        $state.go('home'); //redirect user to home if it does not have permission.
                    }
                }
            }
        })
})


.factory('accessFac', function () {
    var obj = {}
    this.access = false;

    obj.getPermission = function () { //set the permission to true
        this.access = true;
    }

    obj.checkPermission = function () {
        return this.access; //returns the users permission level
    }

    return obj;
})

.controller('homeCtrl', function ($scope) {
    $scope.sayHello = function (name) {
        alert('Hello there! ' + name);
    }
})

.controller('testCtrl', function ($scope, accessFac) {
    $scope.getAccess = function () {
        accessFac.getPermission(); //call the method in acccessFac to allow the user permission.
    }
});
