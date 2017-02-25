'use strict';

angular.module('scrumApp.project', ['ui.router'])

.factory('projectService', ['$http', '$q', function ($http, $q) {

    var ADD_PROJECT_URI = 'http://127.0.0.1:8080/ScrumBoard/services/project/';

    var factory = {
        addProject: addProject
    };

    return factory;

    //Save a Project
    function addProject(projectName, associateId) {
        console.log('control in add project factory method : ', projectName, ' ', associateId);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: ADD_PROJECT_URI,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("projectName", projectName);
                formData.append("associateId", associateId);
                return formData;
            },
            data: {
                model: projectName,
                associateId: associateId
            }
        }).
        success(function (data, status, headers, config) {
            console.log('Add Project Call Success ', data);
            deferred.resolve(data);
        }).
        error(function (data, status, headers, config) {
            console.log('Add Project Failure ', status);
            deferred.reject(data);
        });

        return deferred.promise;
    }

}])

.controller('projectCtrl', ['$scope', '$filter', '$q', '$uibModalInstance', 'projectService', 'SharedService', function ($scope, $filter, $q, $uibModalInstance, projectService, SharedService) {

    console.log('inside project controller ', SharedService.getUserRole());
    $scope.userRole = SharedService.getUserRole();

    //Check if user is logged in, only then continue
    if ($scope.userRole !== 'admin') {
        SharedService.showLoginPage();
        return;
    }

    //save project name
    $scope.saveProject = function (projectName) {
        console.log('Name of the new project is ' + projectName);

        //URI POST call to save the project
        if (projectName !== '' || projectName != null) {
            var promise = projectService.addProject(projectName, SharedService.getAssociateId());
            promise.then(function (result) {
                    console.log('Project added successfully :', result);
                    //Show success message to the user
                    if (result.code === 200) {
                        SharedService.showSuccess('Successfully added the project - ' + projectName);
                    }
                    if (result.code === 404) {
                        SharedService.showWarning(result.message);
                        return;
                    }
                    if (result.code === 403 || result.code === 500) {
                        SharedService.showError(result.message);
                        SharedService.logout();
                        SharedService.showLoginPage();
                        return;
                    }
                })
                .catch(function (resError) {
                    console.log('PROJECT ADD CALL FAILURE :: ', resError.code);
                    //show failure message to the user
                    SharedService.showError('Failed to add the project - ' + projectName);
                });
        }
        //reset form
        resetProjectForm();
        //close modal
        $scope.closeProjectModal();
    }

    //close project modal
    $scope.closeProjectModal = function () {
        $uibModalInstance.dismiss('cancel');
    };

    function resetProjectForm() {
        $scope.projectName = '';
        $scope.addProjectForm.$setPristine();
        $scope.addProjectForm.$setUntouched();
    };

}]);
