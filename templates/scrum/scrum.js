'use strict';

angular.module('scrumApp.scrum', ['ui.router', 'scrumApp.shared'])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('scrum', {
            url: "/scrum",
            templateUrl: "templates/scrum/scrum.html",
            controller: "scrumCtrl"
        })
})

.factory('scrumService', ['$http', '$q', function ($http, $q) {

    var GET_SCRUM_DETAILS_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrumdetails';
    var GET_FILTERED_SCRUM_DETAILS_URI = 'http://127.0.0.1:8080/ScrumBoard/services/filteredscrumdetails';
    var SAVE_SCRUMUPDATE_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrumupdate';

    //test URL
    var TEST_SCRUM_URI = "templates/scrum/scrum.json";

    //define all factory methods
    var factory = {
        getScrumDetails: getScrumDetails,
        getFilteredScrumDetails: getFilteredScrumDetails,
        saveScrumUpdate: saveScrumUpdate
    };

    return factory;

    function getScrumDetails(selectedDate, associateId, projectList) {
        console.log('Getting scrum details for : ', associateId, ' ', selectedDate, ' ', projectList);
        var deferred = $q.defer();
        $http({
                method: 'POST',
                //url: TEST_SCRUM_URI
                url: GET_SCRUM_DETAILS_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("scrumDate", data.scrumDate);
                    formData.append("associateId", data.associateId);
                    formData.append("projectList", angular.toJson(data.projectList));
                    return formData;
                },
                data: {
                    scrumDate: selectedDate,
                    associateId: associateId,
                    projectList: projectList
                }
            })
            .then(
                function success(response) {
                    console.log('scrum details data from web service: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while making service call to fetch scrum details ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

    function getFilteredScrumDetails(selectedDate, associateId, projectName) {
        console.log('Getting filtered scrum details for : ', associateId, ' ', selectedDate, ' ', projectName);
        var deferred = $q.defer();
        $http({
                method: 'POST',
                url: GET_FILTERED_SCRUM_DETAILS_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("scrumDate", selectedDate);
                    formData.append("associateId", associateId);
                    formData.append("projectName", projectName);
                    return formData;
                }
            })
            .then(
                function success(response) {
                    console.log('refined scrum details data from web service: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while making service call to fetch refined scrum details ', errResponse);
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
                console.log('ScrumUpdate Save Operation Success');
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('ScrumUpdate Save Operation Failed ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

}])

.controller('scrumCtrl', ['$scope', 'scrumService', '$filter', '$mdDialog', '$q', 'SharedService', '$state', function ($scope, scrumService, $filter, $mdDialog, $q, SharedService, $state) {

    console.log('inside scrum controller : Associate details - ', SharedService.getAssociateDetails());

    //Check if user is logged in, only then continue
    if (!SharedService.isUserAuthenticated()) {
        console.log("Is user authenticated : ", SharedService.isUserAuthenticated());
        SharedService.logout();
        SharedService.showLoginPage();
        SharedService.showError('Please login to continue');
        return;
    }

    $scope.userRole = SharedService.getUserRole();
    $scope.loggedInUserId = SharedService.getAssociateId();
    $scope.loggedInUserProjects = SharedService.getAssignedProjects();
    this.view_sd_selectedProjectName = '';

    //This will let only the user with admin role peform a refined search
    $scope.isRefinedSearchEnabled = ($scope.userRole !== 'admin');

    var todaysDate = $filter('date')(new Date(), 'd MMM, yyyy');
    fetchTodaysScrumDetails(todaysDate);

    //when page loads, make a server call to fetch today's scrum details
    function fetchTodaysScrumDetails(todaysDate) {
        console.log('fetching scrum details for the date ', todaysDate);
        var promise = scrumService.getScrumDetails(todaysDate, $scope.loggedInUserId, $scope.loggedInUserProjects);
        promise.then(function (result) {
            console.log('result from server call ', result);
            $scope.scrumProjects = result.response;
            console.log('Scrum projects fetched :', $scope.scrumProjects);

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

            //Mark today's date as selected date
            $scope.view_sd_selectedDate = todaysDate;
            //show data table
            $scope.view_sd_isDataFetched = true;
        }).catch(function (resError) {
            notifyUser("Error occurred while retrieving today's scrum details.");
        });
    }

    //fetch all available projects
    $scope.fetchAllProjects = function () {
        console.log('fetching all projects for scrum page display');
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

    //save daily srum update
    $scope.saveScrumUpdate = function (scrumDetails, projectName) {
        console.log('ScrumUpdate details : ', scrumDetails, ' project: ', projectName);

        //URI POST call to save the scrum
        var promise = scrumService.saveScrumUpdate(scrumDetails, $scope.view_sd_selectedDate, projectName, $scope.loggedInUserId);
        promise.then(function (result) {
                console.log('Add Scrum Success, data retrieved :', result);

                //Show success message to the user
                SharedService.showSuccess(result.message);
            })
            .catch(function (resError) {
                console.log('Add scrum failure :: ', resError);
                //show failure message to the user
                SharedService.showError(resError.message);
            });
    }

    //monitor date selected and fetch scrum details
    $scope.$watch('view_sd_rawSelectedDate', function (view_sd_rawSelectedDate) {
        console.log('Is refined search on : ', $scope.view_sd_searchByProject);
        if ($scope.view_sd_searchByProject) {
            console.log('when refined results is in place, cannot call server upon only date selection');
        } else {
            $scope.view_sd_selectedDate = $filter('date')($scope.view_sd_rawSelectedDate, 'd MMM, yyyy');
            console.log('watching....value received : selectedDate', $scope.view_sd_selectedDate);
            //if form valid, then make a server call
            if ($scope.view_sd_selectedDate) {
                console.log('calling server to get scrum details for the date ', $scope.view_sd_selectedDate);
                //make GET call to server
                var promise = scrumService.getScrumDetails($scope.view_sd_selectedDate, $scope.loggedInUserId, $scope.loggedInUserProjects);
                promise.then(function (result) {
                    $scope.scrumProjects = result.response;
                    console.log('Scrum projects fetched :', $scope.scrumProjects);

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

                    //show data table
                    $scope.view_sd_isDataFetched = true;
                }).catch(function (resError) {
                    notifyUser('Error occurred while retrieving scrum details for the date ' + $scope.view_sd_selectedDate);
                });
            }
        }
    });

    //Refined Search - get scrum details for specified date and specified project
    $scope.view_sd_refineProjectSearch = function (projectName, rawSelectedDate) {

        if (projectName && rawSelectedDate) {
            $scope.view_sd_selectedDate = $filter('date')(rawSelectedDate, 'd MMM, yyyy');
            console.log('fetching refined results for ', projectName, ' ', $scope.view_sd_selectedDate);

            //Make call to server
            var promise = scrumService.getFilteredScrumDetails($scope.view_sd_selectedDate, $scope.loggedInUserId, projectName);
            promise.then(function (result) {
                $scope.scrumProjects = result.response;
                console.log('Scrum projects fetched for filtered criteria:', $scope.scrumProjects);

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

                //show data table
                $scope.view_sd_isDataFetched = true;

            }).catch(function (resError) {
                notifyUser('Error occurred while retrieving scrum details for the project : ' + projectName);
            });
        } else {
            notifyUser('To search by a specific project, please select a date and a project, then hit Submit button');
        }

    }

    //apply background color based on a condition
    $scope.getBGColor = function (associateId) {
        if ($scope.loggedInUserId === associateId) {
            return 'seagreen';
        } else {
            return 'lightgray';
        }
    }

    //clear project search
    $scope.clearSearchTerm = function () {
        $scope.searchTerm = '';
    };

    $scope.onSearchChange = function ($event) {
        $event.stopPropagation();
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
