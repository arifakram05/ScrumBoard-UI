'use strict';

angular.module('scrumApp.project', ['ui.router'])

.factory('projectService', ['$http', '$q', function ($http, $q) {

    var ADD_PROJECT_URI = constants.url + 'project/';

    var factory = {
        addProject: addProject
    };

    return factory;

    //Save a Project
    function addProject(project, associateId) {
        console.log('control in add project factory method : ', project, ' ', associateId);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: ADD_PROJECT_URI,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("project", angular.toJson(project));
                formData.append("associateId", associateId);
                return formData;
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
    if (!SharedService.isUserAuthenticated()) {
        console.log("Is user authenticated : ", SharedService.isUserAuthenticated());
        SharedService.logout();
        SharedService.showLoginPage();
        SharedService.showError('Please login to continue');
        return;
    }

    //Check if user has access to this view
    if ($scope.userRole != 'admin') {
        SharedService.logout();
        SharedService.showLoginPage();
        SharedService.showError('You do not have access to this page. Please re-login for security reasons');
        return;
    }

    $scope.isProjectActive = true;
    $scope.projectStatus = 'Active Project';
    $scope.changeProjectStatus = function(status) {
        console.log('is project active :'+!status);
        if(!status) {
            $scope.projectStatus = 'Active Project';
        } else {
            $scope.projectStatus = 'InActive/No-Scrum Project';
        }
    }

    //save project name
    $scope.saveProject = function (projectName) {
        console.log('Name of the new project is ' + projectName);

        var dateCreated = $filter('date')(new Date(), 'd MMM, yyyy');
        var projectStatus;
        if($scope.isProjectActive) {
            projectStatus = 'active';
        } else {
            projectStatus = 'inactive';
        }

        //URI POST call to save the project
        if (projectName !== '' || projectName != null) {
            var project = {};
            project.projectName = projectName;
            project.projectStatus = projectStatus;
            project.dateCreated = dateCreated;

            var promise = projectService.addProject(project, SharedService.getAssociateId());
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
                    if (result.code === 403) {
                        SharedService.showError(result.message);
                        SharedService.logout();
                        SharedService.showLoginPage();
                        return;
                    }
                    if (result.code === 500) {
                        SharedService.showError('Error occurred while processing your request. Please re-login and try the operation again');
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
