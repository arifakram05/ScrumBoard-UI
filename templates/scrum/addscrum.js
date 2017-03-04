'use strict';

angular.module('scrumApp.addScrum', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('addscrum', {
            /*url: '/addscrum',*/
            templateUrl: "templates/scrum/addscrum.html",
            controller: "addScrumCtrl"
        })
})

.factory('addScrumService', ['$http', '$q', function ($http, $q) {

    var ADD_SCRUM_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrum/';
    var UPDATE_SCRUM_URI = 'http://127.0.0.1:8080/ScrumBoard/services/updateScrum/';
    var GET_RECENT_SCRUM_RECORD = 'http://127.0.0.1:8080/ScrumBoard/services/latestScrum?';
    var SEARCH_ASSOCIATES_URI = 'http://127.0.0.1:8080/ScrumBoard/services/searchAssociate?';

    //define all factory methods
    var factory = {
        addScrum: addScrum,
        updateScrum: updateScrum,
        getRecentScrumRecord: getRecentScrumRecord,
        searchAssociates: searchAssociates
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

    function updateScrum(scrum, associate, loggedInAsscID) {
        console.log('Scrum details to udpate: ', scrum, ' ', associate,' ',loggedInAsscID);
        var deferred = $q.defer();

        $http({
            method: 'POST',
            url: UPDATE_SCRUM_URI,
            headers: {
                'Content-Type': undefined
            },

            transformRequest: function (data) {
                var formData = new FormData();
                formData.append("scrumDetails", angular.toJson(data.model));
                formData.append("associateDetails", angular.toJson(data.associate));
                formData.append("associateId", loggedInAsscID);
                return formData;
            },
            data: {
                model: scrum,
                associate: associate
            },
        })
            .success(function (data, status, headers, config) {
            deferred.resolve(data);
        })
            .error(function (data, status, headers, config) {
            console.log('Update Scrum Operation Failed ', status);
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

    function searchAssociates(searchText) {
        console.log('search string : ', searchText);

        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: SEARCH_ASSOCIATES_URI,
            params: {
                associate: searchText
            }
        })
            .then(
            function success(response) {
                console.log('associates retrieved per search criteria: ', response);
                deferred.resolve(response.data);
            },
            function error(errResponse) {
                console.error('Error while making service call to search for associates ', errResponse);
                deferred.reject(errResponse);
            }
        );
        return deferred.promise;
    }

}])

.controller('addScrumCtrl', ['$scope', '$filter', '$q', 'SharedService', 'addScrumService', '$mdDialog', '$element', function ($scope, $filter, $q, SharedService, addScrumService, $mdDialog, $element) {

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

    //add scrum
    $scope.addScrum = function (scrum) {
        if ($scope.addScrumForm.$valid) {

            //check if new scrum date is acceptable
            var oldEndDate;
            var newStartDate
            var newEndDate;
            if ($scope.recentScrumRecord[0] !== undefined && oldEndDate === undefined) {
                oldEndDate = new Date($scope.recentScrumRecord[0].endDate);
            }
            if (newStartDate === undefined) {
                newStartDate = new Date($scope.scrum.startDate);
            }
            if (oldEndDate != null && newStartDate != null) {
                if (oldEndDate >= newStartDate) {
                    notifyUser('Please ensure that scrum start date is greater than ' + $scope.recentScrumRecord[0].endDate);
                    return;
                }
            }
            if (newEndDate === undefined) {
                newEndDate = new Date($scope.scrum.endDate);
            }

            //check if end date is greater than start date
            if (newStartDate >= newEndDate) {
                notifyUser('Please ensure that End Date is greater than Start Date');
                return;
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

    //Update scrum function
    $scope.updateScrum = function (scrum, associate) {
        //check if the operation is Add or Update
        if ($scope.isScrumBeingUpdated != null && $scope.isScrumBeingUpdated === true) {
            //if operation is scrum update, fill in the missing values
            scrum.scrumName = $scope.recentScrumRecord[0].scrumName;
            scrum.startDate = $scope.recentScrumRecord[0].startDate;
            scrum.endDate = $scope.recentScrumRecord[0].endDate;
            scrum.projectName = $scope.selectedProject.projectName;

            console.log('scrum details to udpate ', scrum, ' associate being added : ', associate);

            var associateId = SharedService.getAssociateId();
            //URI POST call to update the scrum details of the project
            var promise = addScrumService.updateScrum(scrum, associate, associateId);
            promise.then(function (result) {
                console.log('Updating Scrum Success, data retrieved :', result);

                if (result.code === 404) {
                    SharedService.showWarning(result.message);
                    return;
                }

                if (result.code === 500) {
                    SharedService.showError(result.message);
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
                console.log('Update scrum failure :: ', resError);
                //show failure message to the user
                SharedService.showError(resError.message);
            });
        }
    }

    //search associates
    $scope.search = function (searchText) {
        console.log("searching for ", searchText);
        var promise = addScrumService.searchAssociates(searchText);
        promise.then(function (result) {
                console.log('got the result from searching associates :', result);
                $scope.filteredAssociates = result.response;
            })
            .catch(function (resError) {
                console.log('search for associates failed :: ', resError);
                //show failure message to the user
                SharedService.showError(resError.message);
            });
    }

    $element.find('input').on('keydown', function (ev) {
        ev.stopPropagation();
    });

    //clear associate search
    $scope.clearSearchTerm = function () {
        $scope.searchTerm = '';
    };

    //clear scrum form
    $scope.clearScrum = function () {
        console.log('clearing all form details');
        $scope.ctrl.rawStartDate = undefined;
        $scope.ctrl.rawEndDate = undefined;
        $scope.selectedProject = undefined;
        $scope.scrum = {};
        $scope.ctrl.selectedAsscForUpdate = undefined;
        $scope.addScrumForm.$setUntouched();
        $scope.addScrumForm.$setPristine();
        //clear retrieved recent scrum record
        $scope.recentScrumRecord = undefined;
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
