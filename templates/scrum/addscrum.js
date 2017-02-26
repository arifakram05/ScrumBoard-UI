'use strict';

angular.module('scrumApp.addScrum', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('addscrum', {
            url: '/addscrum',
            templateUrl: "templates/scrum/addscrum.html",
            controller: "addScrumCtrl"
        })
})

.factory('addScrumService', ['$http', '$q', function ($http, $q) {

    var ADD_SCRUM_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrum/';
    var GET_RECENT_SCRUM_RECORD = 'http://127.0.0.1:8080/ScrumBoard/services/latestScrum?';

    //define all factory methods
    var factory = {
        addScrum: addScrum,
        getRecentScrumRecord: getRecentScrumRecord
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
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Add Scrum Operation Failed ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

    function getRecentScrumRecord(selectedProjectName) {
        console.log('Getting recent scrum record for : ', selectedProjectName);

        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: GET_RECENT_SCRUM_RECORD,
                params: {
                    projectName: selectedProjectName
                }
            })
            .then(
                function success(response) {
                    console.log('recent scrum record from web service: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while making service call to get recent scrum record ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

}])

.controller('addScrumCtrl', ['$scope', '$filter', '$q', 'SharedService', 'addScrumService', '$mdDialog', function ($scope, $filter, $q, SharedService, addScrumService, $mdDialog) {

    console.log('inside add scrum controller');

    $scope.scrum = {};

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

    fetchAllProjects();

    //fetch all available projects
    function fetchAllProjects() {
        if (SharedService.getAllAvailableProjects() != null) {
            $scope.projects = SharedService.getAllAvailableProjects();
        } else {
            var promise = SharedService.getAllProjects();
            promise.then(function (result) {
                    console.log('All projects retrieved :', result);
                    $scope.projects = result;
                    console.log('project list : ', $scope.projects);
                })
                .catch(function (resError) {
                    console.log('Error while fetching projects :: ', resError);
                    //show failure message to the user
                    SharedService.showError('Error occurred while fetching projects');
                });
        }
    }

    //add scrum
    $scope.addScrum = function (scrum) {
        if ($scope.addScrumForm.$valid) {

            //check if new scrum date is acceptable
            var oldEndDate;
            var newStartDate
            if (oldEndDate != null) {
                oldEndDate = new Date($scope.recentScrumRecord[0].endDate);
            }
            if (newStartDate != null) {
                newStartDate = new Date($scope.scrum.startDate);
            }
            if (oldEndDate != null && newStartDate != null) {
                if (oldEndDate >= newStartDate) {
                    notifyUser('Please ensure that scrum start date is greater than ' + $scope.recentScrumRecord[0].endDate);
                    return;
                }
            }

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

                    if (result.code === 404) {
                        SharedService.showWarning(result.message);
                        return;
                    }

                    if (result.code === 500) {
                        SharedService.showError('Error occurred while processing your request. Please re-login and try the operation again');
                        return;
                    }

                    if (result.code === 403) {
                        SharedService.logout();
                        SharedService.showLoginPage();
                        SharedService.showError(result.message);
                        return;
                    }

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

    //monitor selected project and get previous scrum dates
    // only when the data is fetched, user be able to save a new scrum record
    $scope.$watch('selectedProject', function (selectedProject) {
        console.log('project selected to add scrum for is : ', $scope.selectedProject);
        if ($scope.selectedProject) {
            console.log('making a server call to get all scrum records for this project');
            //if form valid, then make a server call
            var promise = addScrumService.getRecentScrumRecord($scope.selectedProject.projectName);
            promise.then(function (result) {
                $scope.recentScrumRecord = result.response;
                console.log('Recent scrum record :', $scope.recentScrumRecord);
                //show recent scrum record for the selected project
                $scope.showRecentScrumRecord = true;
            }).catch(function (resError) {
                console.log('Error occurred while retrieving recent scrum record for ' + $scope.selectedProject.projectName);
            });
        }
    });

    //alerts to user
    function notifyUser(message) {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .textContent(message)
            .ok('Got it!')
        );
    }

}]);
