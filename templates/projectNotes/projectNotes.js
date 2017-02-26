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

    var GET_ALL_PROJECT_NOTES_URI = 'http://127.0.0.1:8080/ScrumBoard/services/projectNotes?';
    var SAVE_PROJECT_NOTES_URI = 'http://127.0.0.1:8080/ScrumBoard/services/projectNote';
    //test URL
    var TEST_SCRUM_URI = "templates/projectNotes/projectNotes.json";

    //define all factory methods
    var factory = {
        getAllNotesForProject: getAllNotesForProject,
        saveNewProjectNote: saveNewProjectNote
    };

    return factory;

    function getAllNotesForProject(selectedProjectName) {
        console.log('Getting project notes for : ', selectedProjectName);

        var deferred = $q.defer();
        $http({
                method: 'GET',
                //url: TEST_SCRUM_URI
                url: GET_ALL_PROJECT_NOTES_URI,
                params: {
                    projectName: selectedProjectName
                }
            })
            .then(
                function success(response) {
                    console.log('project notes details data from web service: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while making service call to fetch project notes details ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    function saveNewProjectNote(projectName, projectNotes, associateId) {
        console.log('Saving a new project notes');
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: SAVE_PROJECT_NOTES_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("projectNotes", angular.toJson(data.projectNotes));
                    formData.append("projectName", projectName);
                    formData.append("associateId", associateId);
                    return formData;
                },
                data: {
                    projectNotes: projectNotes
                }
            })
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('ProjectNotes Save Operation Failed ', status);
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
        SharedService.logout();
        SharedService.showLoginPage();
        SharedService.showError('Please login to continue');
        return;
    }

    $scope.searchTerm;
    $scope.selectedProjectForNotes;
    //$scope.canShowDetailNotes = false;
    $scope.isUserCreatingNewNote = false;
    $scope.newProjectNoteContent;
    $scope.newProjectNoteTitle;

    fetchAllProjects();

    //get all available projects
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

    $element.find('input').on('keydown', function (ev) {
        ev.stopPropagation();
    });

    //clear project search
    $scope.clearSearchTerm = function () {
        $scope.searchTerm = '';
    };

    //monitor project selected and fetch project notes
    $scope.$watch('selectedProjectForNotes', function (selectedProjectForNotes) {
        console.log('selected project to fetch notes for is : ', selectedProjectForNotes);

        //if form valid, then make a server call
        if ($scope.selectedProjectForNotes) {
            //reset project notes area when another project is selected
            $scope.detailedProjectNote = undefined;
            $scope.noteTitle = undefined;
            //getNotesForSelectedProject($scope.selectedProjectForNotes);
            console.log('calling server to get notes for the project ', $scope.selectedProjectForNotes);
            //make GET call to server
            var promise = projectNotesService.getAllNotesForProject($scope.selectedProjectForNotes.projectName);
            promise.then(function (result) {
                $scope.allProjectNotes = result.response;
                console.log('all notes for a project fetched :', $scope.allProjectNotes);
            }).catch(function (resError) {
                notifyUser('Error occurred while retrieving notes for a project ' + resError);
            });
        }
    });

    /*function getNotesForSelectedProject(selProj) {
        console.log('calling server to get notes for the project ', selProj.projectName);
        //make GET call to server
        var promise = projectNotesService.getAllNotesForProject(selProj.projectName);
        promise.then(function (result) {
            $scope.allProjectNotes = result.response;
            console.log('all notes for a project fetched :', $scope.allProjectNotes);
        }).catch(function (resError) {
            notifyUser('Error occurred while retrieving notes for a project ' + resError);
        });
    }*/

    //show selected notes
    $scope.showNotes = function (note) {
        //$scope.canShowDetailNotes = true;
        $scope.isUserCreatingNewNote = false;
        $scope.detailedProjectNote = note.notes
        $scope.noteTitle = note.title;
    }

    /*New Project Related Script*/

    //show text editor
    $scope.addNewNotes = function () {
        $scope.isUserCreatingNewNote = true;
    }

    //save a new note
    $scope.saveNewNote = function (notes, title) {
        console.log('notes details: ' + notes + '  title: ' + title);
        if (notes == null || title == null) {
            notifyUser("You are either missing name for your notes or the notes itself. Please verify and save");
            return;
        }
        //construct projectnotes object
        var associateId = SharedService.getAssociateId();
        var projectNotes = {};
        projectNotes.title = title;
        projectNotes.createdOn = $filter('date')(new Date(), 'd MMM, yyyy');
        projectNotes.notes = notes.replace(/"/g, '\'');
        projectNotes.author = associateId;

        console.log('saving new note for the project: ', $scope.selectedProjectForNotes.projectName);
        console.log('new note details : ', projectNotes);

        //URI POST call to save the new notes
        var promise = projectNotesService.saveNewProjectNote($scope.selectedProjectForNotes.projectName, projectNotes, associateId);
        promise.then(function (result) {
                console.log('Save Project Notes Success, data retrieved :', result);

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

                //cancel New Note
                $scope.cancelNewNote();

                //call get all notes for selected project to refresh notes list
                projectNotesService.getAllNotesForProject($scope.selectedProjectForNotes.projectName);
                //getNotesForSelectedProject($scope.selectedProjectForNotes.projectName);
            })
            .catch(function (resError) {
                console.log('Save Project Notes failure :: ', resError);
                //show failure message to the user
                SharedService.showError(resError.message);
            });
    }

    //cancel working on a new notes
    $scope.cancelNewNote = function () {
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
