var scrumApp = angular.module(
    'scrumApp', [
        'ui.router', 'ui.bootstrap', 'ngMaterial', 'ngMessages', 'angularUtils.directives.dirPagination', 'angular-growl', 'textAngular',
        'scrumApp.scrum',
        'scrumApp.project',
        'scrumApp.associate',
        'scrumApp.addScrum',
        'scrumApp.userDetails',
        'scrumApp.projectNotes',
        'scrumApp.jira',
        'scrumApp.login',
        'scrumApp.logout',
        'scrumApp.shared'
])

.config(function ($stateProvider, $urlRouterProvider, growlProvider, $httpProvider) {

    $urlRouterProvider.otherwise('/login');

    //notifications
    growlProvider.globalTimeToLive(5000);
    growlProvider.globalPosition('bottom-right');
    growlProvider.globalDisableCountDown(true);

    //interceptor for http calls
    $httpProvider.interceptors.push('sbInterceptor');
})

//this method will intercept all http calls
.factory('sbInterceptor', function ($rootScope, $q, $window, growl, $injector) {

    return {
        request: function (config) {
            var SharedService = $injector.get('SharedService');
            console.log('auth token : ', SharedService.getAuthToken());
            console.log('Intercepted Service Call....Adding authToken to request....');
            config.headers = config.headers || {};
            if (SharedService.getAuthToken()) {
                config.headers.Authorization = SharedService.getAuthToken();
            }
            return config;
        },
        response: function (response) {
            if (response.status === 401 || response.status === 403) {
                // handle the case where the user is not authenticated
                SharedService.showError('This operation cannot be performed as you are not authenticated');
            }
            return response || $q.when(response);
        }
    };
})

.controller('mainCtrl', ['$scope', '$uibModal', 'SharedService', function ($scope, $uibModal, SharedService) {

    //monitor date selected and fetch shift details for a custom date
    $scope.$watch(function () {
        $scope.userDetails = SharedService.associateDetails;
        $scope.isUserLoggedIn = SharedService.isUserAuthenticated();

        if ($scope.userDetails != null) {
            $scope.userRole = $scope.userDetails.role;
        }

        return SharedService.associateDetails;
    }, true);

    //Project Modal
    $scope.showProjectModal = function () {
        console.log('opening project modal');
        var modalInstance = $uibModal.open({
            templateUrl: "templates/project/project.html",
            controller: "projectCtrl"
        });
    }

    //User Info Modal
    $scope.showUserInfo = function () {
        console.log('opening modal to show user info');
        var modalInstance = $uibModal.open({
            templateUrl: "templates/associate/userDetails.html",
            controller: "userDetailsCtrl"
        });
    }

}]);
