'use strict';

angular.module('scrumApp.userDetails', ['ui.router'])

.controller('userDetailsCtrl', ['$scope', '$uibModalInstance', 'SharedService', function ($scope, $uibModalInstance, SharedService) {

    console.log('inside userDetails controller');

    //Check if user is logged in, only then continue
    if (!SharedService.isUserAuthenticated()) {
        SharedService.logout();
        SharedService.showLoginPage();
        SharedService.showError('Please login to continue');
        return;
    }

    showUserDetails();

    //show user details
    function showUserDetails() {
        console.log('Showing user details');

        $scope.associateName = SharedService.getAssociateName();
        $scope.associateId = SharedService.getAssociateId();
        $scope.title = SharedService.getUserTitle();
        $scope.assignedProjects = SharedService.getProjectNames();
    }

    //close modal
    $scope.closeUserDetailsModal = function () {
        console.log('closing user details modal');
        $uibModalInstance.dismiss('cancel');
    };

}]);
