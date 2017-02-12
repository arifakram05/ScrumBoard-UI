var scrumApp = angular.module(
    'scrumApp', [
        'ui.router', 'ui.bootstrap', 'ngMaterial', 'ngMessages', 'angularUtils.directives.dirPagination', 'angular-growl',
        'scrumApp.scrum',
        'scrumApp.project',
        'scrumApp.associate',
        'scrumApp.login',
        'scrumApp.logout',
        'scrumApp.shared'
])

.config(function ($stateProvider, $urlRouterProvider, growlProvider) {

    $urlRouterProvider.otherwise('/login');
    growlProvider.globalTimeToLive(5000);
    growlProvider.globalPosition('bottom-right');
    growlProvider.globalDisableCountDown(true);
})

.controller('mainCtrl', ['$scope', '$uibModal', 'SharedService', function ($scope, $uibModal, SharedService) {

    //monitor date selected and fetch shift details for a custom date
    $scope.$watch(function () {
        console.log('watching associate details : ', SharedService.associateDetails);

        $scope.userDetails = SharedService.associateDetails;

        $scope.isUserLoggedIn = SharedService.isUserAuthenticated();

        if ($scope.userDetails !== undefined) {
            console.log('FROM MAINCTRL -  user details :: ', $scope.userDetails);
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

    //Associate Modal
    $scope.showAssociateModal = function () {
        console.log('opening associate modal');
        var modalInstance = $uibModal.open({
            templateUrl: "templates/associate/associate.html",
            controller: "associateCtrl"
        });
    }

}]);
