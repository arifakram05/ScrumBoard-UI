'use strict';

angular.module('scrumApp.associate', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('addAssociate', {
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
                if (data.code === 200) {
                    console.log('Add Associate Operation Success');
                    deferred.resolve(data);
                } else {
                    deferred.reject(data);
                }
            })
            .error(function (data, status, headers, config) {
                console.log('Add Associate Operation Failed ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

}])

.controller('associateCtrl', ['$scope', '$filter', '$q', 'SharedService', 'associateService', '$element', function ($scope, $filter, $q, SharedService, associateService, $element) {

    console.log('inside associate controller');

    $scope.userRole = SharedService.getUserRole();

    //Check if user is logged in, only then continue
    if ($scope.userRole !== 'admin' && $scope.userRole !== 'lead') {
        SharedService.showLoginPage();
        return;
    }

    $scope.associate = {
        projects: []
    };

    $scope.searchTerm;

    var loggedInAssociateId = SharedService.getAssociateId();

    fetchAllProjects();

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

    //save associate name
    $scope.saveAssociate = function (associate) {
        //add projects list
        console.log('Details of the associate being added to the project is ', associate);
        console.log('projects: ', $scope.projects);

        //URI POST call to save the associate
        var promise = associateService.addAssociate(associate, loggedInAssociateId);
        promise.then(function (result) {
                console.log('Add associate Success, data retrieved :', result);

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

    //clear project search
    $scope.clearSearchTerm = function () {
        $scope.searchTerm = '';
    };

    //clear form
    $scope.clearAssociateForm = function () {
        console.log('clearing all form details');
        $scope.associate = {
            projects: []
        };
        $scope.project = undefined;
        //$scope.selectedProjects = [{}];
        $scope.addAssociateForm.$setUntouched();
        $scope.addAssociateForm.$setPristine();
    };

    $scope.titles = ["Team Lead", "Scrum Master", "Team Member"];

    $scope.canShowSaveButton = function(associate) {
        console.log('examining associate object: ',associate);
        if(associate.associateId && associate.associateName) {
            return true;
        } else {
            return false;
        }
    }
    //$scope.selectedProjects = [{}];

    //function to add selected projects as an array of objects
    /*$scope.selectedProject = function (project) {
        console.log('selected prj : ', project);
        $scope.associate.projects.push(project);
    }*/

}]);
