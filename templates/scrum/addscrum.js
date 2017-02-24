'use strict';

angular.module('scrumApp.addScrum', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('addscrum', {
            templateUrl: "templates/scrum/addscrum.html",
            controller: "addScrumCtrl"
        })
})

.factory('addScrumService', ['$http', '$q', function ($http, $q) {

    var ADD_SCRUM_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrum/';

    //define all factory methods
    var factory = {
        addScrum: addScrum
    };

    return factory;

    function addScrum(scrum, associateId) {
        console.log('Scrum details to save: ', scrum, ' ', associateId);
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: ADD_SCRUM_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("scrumDetails", angular.toJson(data.model));
                    formData.append("associateId", associateId);
                    return formData;
                },
                data: {
                    model: scrum,
                    associateId: associateId
                },
            })
            .success(function (data, status, headers, config) {
                if (data.code === 200) {
                    console.log('Add Scrum Operation Success');
                    deferred.resolve(data);
                } else {
                    deferred.reject(data);
                }
            })
            .error(function (data, status, headers, config) {
                console.log('Add Scrum Operation Failed ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

}])

.controller('addScrumCtrl', ['$scope', '$filter', '$q', 'SharedService', 'addScrumService', function ($scope, $filter, $q, SharedService, addScrumService) {

    console.log('inside add scrum controller');

    $scope.scrum = {};

    $scope.userRole = SharedService.getUserRole();

    //Check if user is logged in, only then continue
    if ($scope.userRole !== 'admin') {
        SharedService.logout();
        SharedService.showLoginPage();
        return;
    }

    fetchAllProjects();

    //fetch all available projects
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

    //add scrum
    $scope.addScrum = function (scrum) {
        if ($scope.addScrumForm.$valid) {
            $scope.addScrumForm.$setSubmitted();

            //add selected project name to the scrum
            $scope.scrum.projectName = $scope.selectedProject.projectName;

            console.log('Scrum details being added are ', scrum);
            console.log('projects: ', $scope.projects);

            var associateId = SharedService.getAssociateId();
            //URI POST call to save the scrum
            var promise = addScrumService.addScrum(scrum, associateId);
                promise.then(function (result) {
                console.log('Add Scrum Success, data retrieved :', result);

                //Show success message to the user
                SharedService.showSuccess(result.message);

                //clear the form
                $scope.clearScrum();
            })
            .catch(function (resError) {
                console.log('Add scrum failure :: ', resError);
                //show failure message to the user
                SharedService.showError(resError.message);
            });
        }
    }

    $scope.clearScrum = function () {
        console.log('clearing all form details');
        $scope.rawStartDate = undefined;
        $scope.rawEndDate = undefined;
        $scope.selectedProject = undefined;
        $scope.scrum = {};
        $scope.addScrumForm.$setUntouched();
        $scope.addScrumForm.$setPristine();
    };

}]);
