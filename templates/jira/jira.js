'use strict';

angular.module('scrumApp.jira', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('jira', {
            /*url: '/jira',*/
            templateUrl: "templates/jira/jira.html",
            controller: "jiraCtrl"
        })
})

.factory('jiraService', ['$http', '$q', function ($http, $q) {

    var JIRA_URI = constants.url+'jira/';
    //var TEST_JIRA_URI = "templates/jira/jira.json";

    //define all factory methods
    var factory = {
        getJiraDetails: getJiraDetails
    };

    return factory;

    function getJiraDetails(jira, userId) {
        JIRA_URI = constants.url+'jira/' + jira.associateId;
        console.log('Retrieving JIRA details for : ', jira, ' ', userId);
        var deferred = $q.defer();
        $http({
                method: 'GET',
                //url: TEST_JIRA_URI
                url: JIRA_URI,
                params : {
                    maxResults: jira.maxResults,
                    status: jira.status,
                    user: userId
                }
            })
            .then(
                function success(response) {
                    console.log('JIRA details retrieved: ', response);
                    deferred.resolve(response.data);
                },
                function error(errResponse) {
                    console.error('Error while retrieving jira details ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

}])

.controller('jiraCtrl', ['$scope', '$filter', '$q', 'SharedService', 'jiraService', '$mdDialog', function ($scope, $filter, $q, SharedService, jiraService, $mdDialog) {

    var associateId = SharedService.getAssociateId();

    $scope.jira = {

    };

    console.log('inside jira controller');

    $scope.jiraURL = 'https://jira2.cerner.com/browse/';

    $scope.jiraStatuses = ['All','Open', 'Closed', 'In Progress', 'Engineering Complete', 'Submitted', 'In Review', 'Verified', 'Blocked', 'Reopened',
                         'Investigation', 'Approved', 'Missed', 'Failed in Testing', 'In Code Review',  'Released', 'Deployed',
                         'Waiting for Client Input', 'Scheduled', 'Resolved', 'On Hold',  'Pending Approval', 'Pending Agreement',
                         'Pending Client Action', 'Pending Final Review',
                        ];

    $scope.canShowSubmitButton = function (jira) {
        if (jira.associateId) {
            return true;
        } else {
            return false;
        }
    }

    $scope.jiraStatusChange = function(jiraStatus) {
        $scope.isJIRAStatusSel = jiraStatus;
    }

    $scope.findJiras = function (jira) {
        console.log('jira details to fetch : ', jira);
        if(jira.maxResults === undefined || jira.maxResults === "") {
            jira.maxResults = 5;
        }
        if(jira.status === undefined) {
            jira.status = 'All';
        }

        //URI POST call to save the scrum
        var promise = jiraService.getJiraDetails(jira, associateId);
        promise.then(function (result) {
                console.log('JIRA details retrieved :', result.response);
                $scope.jiraDetails = result.response;
            })
            .catch(function (resError) {
                console.log('Failed to retrieve JIRA details :: ', resError);
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
