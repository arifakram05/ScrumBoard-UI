'use strict';

angular.module('scrumApp.associate', ['ui.router'])

/*.factory('associateService', ['$http', '$q', function ($http, $q) {



    }])*/

.controller('associateCtrl', ['$scope', '$filter', '$q', '$uibModalInstance', 'SharedService', function ($scope, $filter, $q, $uibModalInstance, SharedService) {

    console.log('inside associate controller');

    fetchAllProjects();

    function fetchAllProjects() {
        var promise = SharedService.getAllProjects();
        promise.then(function (result) {
                console.log('All projects retrieved :', result);
                $scope.projects = result.response;
                console.log('project list : ', $scope.projects);
            })
            .catch(function (resError) {
                console.log('Error while fetching projects :: ', resError);
                //show failure message to the user
                SharedService.showError('Error occurred while fetching projects');
            });
    }

    //save associate name
    $scope.saveAssociate = function (associate) {
        console.log('Details of the associate being added to the project is ', associate);

        //URI POST call to save the associate


        //when success, close the modal and show the success message as floating div
        $scope.closeAssociateModal();
    }

    $scope.closeAssociateModal = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.roles = [
        {
            name: 'Project Lead'
        }, {
            name: 'Scrum Master'
        }, {
            name: 'Team Member'
        }
    ];

}]);
