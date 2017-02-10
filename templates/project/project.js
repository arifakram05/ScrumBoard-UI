'use strict';

angular.module('scrumApp.project', ['ui.router'])

/*.factory('projectService', ['$http', '$q', function ($http, $q) {



    }])*/

.controller('projectCtrl', ['$scope', '$filter', '$q', '$uibModalInstance', function ($scope, $filter, $q, $uibModalInstance) {

    console.log('inside project controller');

    //save project name
    $scope.saveProject = function (projectName) {
        console.log('Name of the new project is ' + projectName);

        //URI POST call to save the project


        //when success, close the modal and show the success message as floating div
        $scope.closeProjectModal();
    }

    $scope.closeProjectModal = function () {
        $uibModalInstance.dismiss('cancel');
    };

}]);
