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
            if (data.code !== 200) {
                deferred.reject(data);
            }
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

    console.log('inside project controller');

    //Check if user is logged in, only then continue
    if (!SharedService.isUserAuthenticated() && !SharedService.isUserAdmin()) {
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
                    if(result.code === 200) {
                        showSuccessMessageToUser('Successfully added the project - ' + projectName);
                    }
                })
                .catch(function (resError) {
                    console.log('PROJECT ADD CALL FAILURE :: ', resError.code);
                    //show failure message to the user
                    if (resError.code === 403) {
                        showFailureMessageToUser(resError.message);
                        //redirect to login page
                        SharedService.logout();
                        SharedService.showLoginPage();
                    } else if(resError.code === 404) {
                        SharedService.showWarning(resError.message);
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
