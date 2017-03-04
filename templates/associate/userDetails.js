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

    //show other associates details
    //search associates
    $scope.search = function (searchText) {
        var promise = SharedService.searchAssociates(searchText);
        promise.then(function (result) {
            console.log('got the result from searching associates :', result);
            $scope.filteredAssociates = result.response;
            //$scope.filteredAssociates = processSearchResults(result.response);
        })
            .catch(function (resError) {
            console.log('search for associates failed :: ', resError);
            //show failure message to the user
            SharedService.showError(resError.message);
        });
    }

    //close modal
    $scope.closeUserDetailsModal = function () {
        console.log('closing user details modal');
        $uibModalInstance.dismiss('cancel');
    };

}]);
