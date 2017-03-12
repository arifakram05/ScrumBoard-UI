'use strict';

angular.module('scrumApp.associate', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('addAssociate', {
            /*url: '/associate',*/
            templateUrl: "templates/associate/associate.html",
            controller: "associateCtrl"
        })
})

.factory('associateService', ['$http', '$q', function ($http, $q) {

    var ADD_ASSOCIATE_URI = 'http://127.0.0.1:8080/ScrumBoard/services/associate/';

    //define all factory methods
    var factory = {
        addAssociate: addAssociate
    };

    return factory;

    function addAssociate(associate, associateId) {
        console.log('Associate details to save: ', associate);
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: ADD_ASSOCIATE_URI,
                params: {
                    isRegistration: false
                },
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("associateDetails", angular.toJson(data.model));
                    formData.append("associateId", associateId);
                    return formData;
                },
                data: {
                    model: associate,
                    associateId: associateId
                }
            })
            .success(function (data, status, headers, config) {
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                deferred.reject(data);
            });
        return deferred.promise;
    }

}])

.controller('associateCtrl', ['$scope', '$filter', '$q', 'SharedService', 'associateService', '$element', '$mdDialog', function ($scope, $filter, $q, SharedService, associateService, $element, $mdDialog) {

    console.log('inside associate controller');

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
    if ($scope.userRole == 'member') {
        SharedService.logout();
        SharedService.showLoginPage();
        SharedService.showError('You do not have access to this page. Please re-login for security reasons');
        return;
    }

    $scope.associate = {
        projects: []
    };

    $scope.searchTerm;
    $scope.asscSearchTerm;

    var loggedInAssociateId = SharedService.getAssociateId();

    fetchAllProjects();

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

    //search associates
    $scope.search = function (searchText) {
        var promise = SharedService.searchAssociates(searchText);
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

    //this is the fix for having dynamic search inside tabs
    $scope.onSearchChange = function ($event) {
        $event.stopPropagation();
    }

    //save associate name
    $scope.saveAssociate = function (associate) {
        //add projects list
        console.log('Details of the associate being added to the project is ', associate);
        console.log('projects: ', $scope.projects);

        if (associate.title === 'Scrum Master' && $scope.userRole !== 'admin') {
            notifyUser('You do not have privileges to make an associate Scrum Master');
            return;
        }

        //URI POST call to save the associate
        var promise = associateService.addAssociate(associate, loggedInAssociateId);
        promise.then(function (result) {
                console.log('Add associate Success, data retrieved :', result);

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

                //clear form
                $scope.clearAssociateForm();
            })
            .catch(function (resError) {
                console.log('Add associate failure :: ', resError);
                //show failure message to the user
                SharedService.showError(resError.message);
            });
    }

    //assign projects to associate
    $scope.assignProjects = function (associate) {

        if (associate.title === 'Scrum Master' && $scope.userRole !== 'admin') {
            notifyUser('You do not have privileges to make an associate Scrum Master');
            return;
        }

        associate.associateId = $scope.selectedAsscForUpdate.associateId;
        /*associate.associateName = $scope.selectedAsscForUpdate.associateName;
        associate.emailId = $scope.selectedAsscForUpdate.emailId;*/

        console.log('assigning prjs to associate, details: ', associate, $scope.selectedAsscForUpdate);

        //URI POST call to add projects to associate
        var promise = associateService.addAssociate(associate, loggedInAssociateId);
        promise.then(function (result) {
                console.log('Add associate Success, data retrieved :', result);

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

                //clear form
                $scope.clearAssignPrjsForm();
            })
            .catch(function (resError) {
                console.log('Assign projects to associate failure :: ', resError);
                //show failure message to the user
                SharedService.showError(resError.message);
            });
    }

    //clear project search
    $scope.clearSearchTerm = function () {
        $scope.searchTerm = '';
    };

    //clear associate search
    $scope.clearAsscSearchTerm = function () {
        $scope.asscSearchTerm = '';
    };

    //clear form
    $scope.clearAssociateForm = function () {
        console.log('clearing all form details');
        $scope.associate = {
            projects: []
        };
        $scope.project = undefined;
        $scope.selectedAsscForUpdate = undefined;
        $scope.addAssociateForm.$setUntouched();
        $scope.addAssociateForm.$setPristine();
    };

    //clear assign prjs form
    $scope.clearAssignPrjsForm = function () {
        $scope.selectedAsscForUpdate = undefined;
        $scope.associate = {
            projects: []
        };
        $scope.addAssociateToPrjsForm.$setUntouched();
        $scope.addAssociateToPrjsForm.$setPristine();
    }

    $scope.titles = ["Team Lead", "Scrum Master", "Team Member"];

    $scope.canShowSaveButton = function (associate) {
        if (associate.associateId && associate.associateName && associate.emailId) {
            return true;
        } else {
            return false;
        }
    }

    $scope.canShowSaveButtonForAssignPrjs = function (associate) {
        if ($scope.selectedAsscForUpdate && (associate.title || associate.projects)) {
            return true;
        } else {
            return false;
        }
    }

    //reset password functionality
    $scope.resetPassword = function () {
        var associate = {
            projects: []
        };
        associate.associateId = $scope.selectedAsscForReset.associateId;
        associate.password = "reset";
        //URI POST call to add projects to associate
        var promise = associateService.addAssociate(associate, loggedInAssociateId);
        promise.then(function (result) {
                console.log('associate details recorded for reset :', result);

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

                //clear
                $scope.selectedAsscForReset = undefined;
            })
            .catch(function (resError) {
                console.log('Assign projects to associate failure :: ', resError);
                //show failure message to the user
                SharedService.showError(resError.message);
            });
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
