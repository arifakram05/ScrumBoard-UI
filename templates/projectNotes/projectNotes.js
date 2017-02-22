'use strict';

angular.module('scrumApp.projectNotes', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('projectNotes', {
            templateUrl: "templates/projectNotes/projectNotes.html",
            controller: "projectNotesCtrl"
        })
})

.factory('projectNotesService', ['$http', '$q', function ($http, $q) {

    var GET_ALL_PROJECT_NOTES_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrumdetails?';
    var SAVE_SCRUMUPDATE_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrumupdate';

    //test URL
    var TEST_SCRUM_URI = "templates/projectNotes/projectNotes.json";

    //define all factory methods
    var factory = {
        getAllNotesForProject: getAllNotesForProject,
        saveScrumUpdate: saveScrumUpdate
    };

    return factory;

    function getAllNotesForProject(selectedProjectName) {
        console.log('Getting project notes for : ', selectedProjectName);

        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: TEST_SCRUM_URI
            //url: GET_ALL_PROJECT_NOTES_URI
        })
            .then(
            function success(response) {
                console.log('projct notes details data from web service: ', response);
                deferred.resolve(response.data);
            },
            function error(errResponse) {
                console.error('Error while making service call to fetch project notes details ', errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }

    function saveScrumUpdate(scrumDetails, date, projectName, associateId) {
        console.log('ScrumUpdate to save: ', scrumDetails, ' date: ', date, ' project: ', projectName);
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: SAVE_SCRUMUPDATE_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("scrumDetails", angular.toJson(data.model));
                    formData.append("date", date);
                    formData.append("projectName", projectName);
                    formData.append("associateId", associateId);
                    return formData;
                },
                data: {
                    model: scrumDetails,
                    date: date,
                    projectName: projectName,
                    associateId: associateId
                }
            })
            .success(function (data, status, headers, config) {
                if (data.code === 200) {
                    console.log('ScrumUpdate Save Operation Success');
                    deferred.resolve(data);
                } else {
                    deferred.reject(data);
                }
            })
            .error(function (data, status, headers, config) {
                console.log('ScrumUpdate Save Operation Failed ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

}])

.controller('projectNotesCtrl', ['$scope', 'projectNotesService', '$filter', '$mdDialog', '$q', 'SharedService', '$state', '$element', function ($scope, projectNotesService, $filter, $mdDialog, $q, SharedService, $state, $element) {

    console.log('inside project notes controller : Associate details - ', SharedService.getAssociateDetails());

    //Check if user is logged in, only then continue
    if (!SharedService.isUserAuthenticated()) {
        console.log("Is user authenticated : ", SharedService.isUserAuthenticated());
        SharedService.showLoginPage();
        return;
    }

    $scope.searchTerm;
    $scope.selectedProjectForNotes;
    //$scope.canShowDetailNotes = false;
    $scope.isUserCreatingNewNote = false;

    fetchAllProjects();

    //get all available projects
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

    $element.find('input').on('keydown', function (ev) {
        ev.stopPropagation();
    });

    //clear project search
    $scope.clearSearchTerm = function () {
        $scope.searchTerm = '';
    };

    //monitor date selected and fetch scrum details
    $scope.$watch('selectedProjectForNotes', function (selectedProjectForNotes) {
        console.log('selected project to fetch notes for is : ', selectedProjectForNotes);

        //if form valid, then make a server call
        if ($scope.selectedProjectForNotes) {
            console.log('calling server to get notes for the project ', $scope.selectedProjectForNotes);
            //make GET call to server
            var promise = projectNotesService.getAllNotesForProject($scope.selectedProjectForNotes);
            promise.then(function (result) {
                $scope.allProjectNotes = result;
                console.log('all notes for a project fetched :', $scope.allProjectNotes);
            }).catch(function (resError) {
                notifyUser('Error occurred while retrieving notes for a project ' + resError);
            });
        }
    });

    //show selected notes
    $scope.showNotes = function (note) {
        //$scope.canShowDetailNotes = true;
        $scope.isUserCreatingNewNote = false;
        $scope.detailedProjectNote = note.notes
    }

    /*New Project Related Script*/
    $scope.addNewNotes = function () {
        $scope.isUserCreatingNewNote = true;
    }

    $scope.cancelNewNote = function() {
        $scope.isUserCreatingNewNote = false;
    }

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
