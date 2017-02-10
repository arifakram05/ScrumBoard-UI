'use strict';

angular.module('scrumApp.associate', ['ui.router'])

/*.factory('associateService', ['$http', '$q', function ($http, $q) {



    }])*/

.controller('associateCtrl', ['$scope', '$filter', '$q', '$uibModalInstance', function ($scope, $filter, $q, $uibModalInstance) {

    console.log('inside associate controller');

    //save associate name
    $scope.saveAssociate = function (associateName) {
        console.log('Name of the associate being added to the project is ' + associateName);

        //URI POST call to save the associate


        //when success, close the modal and show the success message as floating div
        $scope.closeAssociateModal();
    }

    $scope.closeAssociateModal = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);
