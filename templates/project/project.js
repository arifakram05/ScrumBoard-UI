'use strict';

angular.module('scrumApp.project', ['ui.router'])

.factory('projectService', ['$http', '$q', function ($http, $q) {

    var ADD_PROJECT_URI = 'http://127.0.0.1:8080/ScrumBoard/services/project/';

    var factory = {
        addProject: addProject
    };

    return factory;

    //Save a Project
    function addProject(projectDetails) {
        console.log('control in add project factory method : ', projectDetails);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: ADD_PROJECT_URI,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("projectDetails", angular.toJson(data.model));
                return formData;
            },
            data: {
                model: projectDetails
            }
        }).
        success(function (data, status, headers, config) {
            if (data.code !== 200) {
                deferred.reject(data);
            }
            console.log('Add Project Success ', data);
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

    console.log('inside project controller');

    $scope.project = {};

    //Check if user is logged in, only then continue
    if (!SharedService.isUserAuthenticated() && !SharedService.isUserAdmin()) {
        SharedService.showLoginPage();
        return;
    }

    //save project name
    $scope.saveProject = function (projectName) {
        console.log('Name of the new project is ' + projectName);

        $scope.project.projectName = projectName;
        $scope.project.authToken = SharedService.getAuthToken();
        $scope.project.associateId = SharedService.getAssociateId();

        //URI POST call to save the project
        if (projectName !== '' || projectName != null) {
            var promise = projectService.addProject($scope.project);
            promise.then(function (result) {
                    console.log('Project added successfully :', result);
                    //Show success message to the user
                    showSuccessMessageToUser('Successfully added the project - ' + projectName);
                })
                .catch(function (resError) {
                    console.log('PROJECT ADD FAILURE :: ', resError);
                    //show failure message to the user
                    if(resError.code === 403) {
                        showFailureMessageToUser('Login expired. Please re-login');
                        //redirect to login page
                        SharedService.logout();
                        SharedService.showLoginPage();
                    } else {
                        showFailureMessageToUser('Failed to add the project - ' + projectName);
                    }
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
        $scope.project = {};
        $scope.projectName = '';
        $scope.addProjectForm.$setPristine();
        $scope.addProjectForm.$setUntouched();
    };

    function showSuccessMessageToUser(message) {
        SharedService.showSuccess(message);
    }

    function showFailureMessageToUser(message) {
        SharedService.showError(message);
    }

}]);
