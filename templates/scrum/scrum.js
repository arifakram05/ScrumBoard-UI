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

    var GET_SCRUM_DETAILS_URI = 'http://127.0.0.1:8080/ScrumBoard/services/scrumdetails?';
    var GET_FILTERED_SCRUM_DETAILS_URI = '';
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

    function getScrumDetails(selectedDate) {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                //url: TEST_SCRUM_URI
                url: GET_SCRUM_DETAILS_URI,
                params: {
                    scrumDate: selectedDate,
                    projectName: 'scrum'
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

    function getFilteredScrumDetails(todaysDate, projectName) {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: TEST_SCRUM_URI
                    //url: GET_FILTERED_SCRUM_DETAILS_URI
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

    function saveScrumUpdate(scrumDetails, date, projectName) {
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
                    return formData;
                },
                data: {
                    model: scrumDetails,
                    date: date,
                    projectName: projectName
                },
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

.controller('scrumCtrl', ['$scope', 'scrumService', '$filter', '$mdDialog', '$q', 'SharedService', '$state', function ($scope, scrumService, $filter, $mdDialog, $q, SharedService, $state) {

    console.log('inside scrum controller : Associate details - ', SharedService.getAssociateDetails());

    //Check if user is logged in, only then continue
    if (!SharedService.isUserAuthenticated()) {
        console.log("Is user authenticated : ", SharedService.isUserAuthenticated());
        SharedService.showLoginPage();
        return;
    }

    $scope.userRole = SharedService.getUserRole();
    $scope.loggedInUserId = SharedService.getAssociateId();

    this.view_sd_selectedProjectName = '';
    $scope.projects = getProjects();

    var todaysDate = $filter('date')(new Date(), 'd MMM, yyyy');
    fetchTodaysScrumDetails(todaysDate);

    //when page loads, make a server call to fetch today's scrum details
    function fetchTodaysScrumDetails(todaysDate) {
        console.log('fetching scrum details for the date ', todaysDate);
        var promise = scrumService.getScrumDetails(todaysDate);
        promise.then(function (result) {
            $scope.scrumProjects = result.response;
            console.log('Scrum projects fetched :', $scope.scrumProjects);
            //Mark today's date as selected date
            $scope.view_sd_selectedDate = todaysDate;
            //show data table
            $scope.view_sd_isDataFetched = true;
        }).catch(function (resError) {
            notifyUser("Error occurred while retrieving today's scrum details.");
        });
    }

    //save daily srum update
    $scope.saveScrumUpdate = function (scrumDetails, projectName) {
        console.log('ScrumUpdate details : ', scrumDetails, ' project: ', projectName);

        //URI POST call to save the scrum
        var promise = scrumService.saveScrumUpdate(scrumDetails, $scope.view_sd_selectedDate, projectName);
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
        if ($scope.view_sd_searchByProject) {
            console.log('when refined results is in place, cannot call server upon only date selection');
        } else {
            $scope.view_sd_selectedDate = $filter('date')($scope.view_sd_rawSelectedDate, 'd MMM, yyyy');
            console.log('watching....value received : selectedDate', $scope.view_sd_selectedDate);
            //if form valid, then make a server call
            if ($scope.view_sd_selectedDate) {
                console.log('calling server to get scrum details for the date ', $scope.view_sd_selectedDate);
                //make GET call to server
                var promise = scrumService.getScrumDetails($scope.view_sd_selectedDate);
                promise.then(function (result) {
                    $scope.scrumProjects = result.response;
                    console.log('Scrum projects fetched :', $scope.scrumProjects);
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

            //Make GET call to server
            var promise = scrumService.getFilteredScrumDetails($scope.view_sd_selectedDate, projectName);
            promise.then(function (result) {
                $scope.scrumProjects = result;
                console.log('Scrum projects fetched :', $scope.scrumProjects);
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
        if($scope.loggedInUserId === associateId) {
            return 'seagreen';
        } else {
            return 'lightgray';
        }
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

function getProjects() {
    return [{
        "name": "Alabama",
        "abbreviation": "AL"
    }, {
        "name": "Alaska",
        "abbreviation": "AK"
    }, {
        "name": "American Samoa",
        "abbreviation": "AS"
    }, {
        "name": "Arizona",
        "abbreviation": "AZ"
    }, {
        "name": "Arkansas",
        "abbreviation": "AR"
    }, {
        "name": "California",
        "abbreviation": "CA"
    }, {
        "name": "Colorado",
        "abbreviation": "CO"
    }, {
        "name": "Connecticut",
        "abbreviation": "CT"
    }, {
        "name": "Delaware",
        "abbreviation": "DE"
    }, {
        "name": "District Of Columbia",
        "abbreviation": "DC"
    }, {
        "name": "Federated States Of Micronesia",
        "abbreviation": "FM"
    }, {
        "name": "Florida",
        "abbreviation": "FL"
    }, {
        "name": "Georgia",
        "abbreviation": "GA"
    }, {
        "name": "Guam",
        "abbreviation": "GU"
    }, {
        "name": "Hawaii",
        "abbreviation": "HI"
    }, {
        "name": "Idaho",
        "abbreviation": "ID"
    }, {
        "name": "Illinois",
        "abbreviation": "IL"
    }, {
        "name": "Indiana",
        "abbreviation": "IN"
    }, {
        "name": "Iowa",
        "abbreviation": "IA"
    }, {
        "name": "Kansas",
        "abbreviation": "KS"
    }, {
        "name": "Kentucky",
        "abbreviation": "KY"
    }, {
        "name": "Louisiana",
        "abbreviation": "LA"
    }, {
        "name": "Maine",
        "abbreviation": "ME"
    }, {
        "name": "Marshall Islands",
        "abbreviation": "MH"
    }, {
        "name": "Maryland",
        "abbreviation": "MD"
    }, {
        "name": "Massachusetts",
        "abbreviation": "MA"
    }, {
        "name": "Michigan",
        "abbreviation": "MI"
    }, {
        "name": "Minnesota",
        "abbreviation": "MN"
    }, {
        "name": "Mississippi",
        "abbreviation": "MS"
    }, {
        "name": "Missouri",
        "abbreviation": "MO"
    }, {
        "name": "Montana",
        "abbreviation": "MT"
    }, {
        "name": "Nebraska",
        "abbreviation": "NE"
    }, {
        "name": "Nevada",
        "abbreviation": "NV"
    }, {
        "name": "New Hampshire",
        "abbreviation": "NH"
    }, {
        "name": "New Jersey",
        "abbreviation": "NJ"
    }, {
        "name": "New Mexico",
        "abbreviation": "NM"
    }, {
        "name": "New York",
        "abbreviation": "NY"
    }, {
        "name": "North Carolina",
        "abbreviation": "NC"
    }, {
        "name": "North Dakota",
        "abbreviation": "ND"
    }, {
        "name": "Northern Mariana Islands",
        "abbreviation": "MP"
    }, {
        "name": "Ohio",
        "abbreviation": "OH"
    }, {
        "name": "Oklahoma",
        "abbreviation": "OK"
    }, {
        "name": "Oregon",
        "abbreviation": "OR"
    }, {
        "name": "Palau",
        "abbreviation": "PW"
    }, {
        "name": "Pennsylvania",
        "abbreviation": "PA"
    }, {
        "name": "Puerto Rico",
        "abbreviation": "PR"
    }, {
        "name": "Rhode Island",
        "abbreviation": "RI"
    }, {
        "name": "South Carolina",
        "abbreviation": "SC"
    }, {
        "name": "South Dakota",
        "abbreviation": "SD"
    }, {
        "name": "Tennessee",
        "abbreviation": "TN"
    }, {
        "name": "Texas",
        "abbreviation": "TX"
    }, {
        "name": "Utah",
        "abbreviation": "UT"
    }, {
        "name": "Vermont",
        "abbreviation": "VT"
    }, {
        "name": "Virgin Islands",
        "abbreviation": "VI"
    }, {
        "name": "Virginia",
        "abbreviation": "VA"
    }, {
        "name": "Washington",
        "abbreviation": "WA"
    }, {
        "name": "West Virginia",
        "abbreviation": "WV"
    }, {
        "name": "Wisconsin",
        "abbreviation": "WI"
    }, {
        "name": "Wyoming",
        "abbreviation": "WY"
    }];
}
