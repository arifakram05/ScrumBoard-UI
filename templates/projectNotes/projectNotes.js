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

    var GET_SCRUM_DETAILS_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrumdetails?';
    var SAVE_SCRUMUPDATE_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrumupdate';

    //test URL
    var TEST_SCRUM_URI = "templates/scrum/scrum.json";

    //define all factory methods
    var factory = {
        getScrumDetails: getScrumDetails,
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

.controller('projectNotesCtrl', ['$scope', 'projectNotesService', '$filter', '$mdDialog', '$q', 'SharedService', '$state', function ($scope, projectNotesService, $filter, $mdDialog, $q, SharedService, $state) {

    console.log('inside project notes controller : Associate details - ', SharedService.getAssociateDetails());

    //Check if user is logged in, only then continue
    if (!SharedService.isUserAuthenticated()) {
        console.log("Is user authenticated : ", SharedService.isUserAuthenticated());
        SharedService.showLoginPage();
        return;
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
