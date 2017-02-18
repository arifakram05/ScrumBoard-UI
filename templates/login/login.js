angular.module('scrumApp.login', ['ui.router', 'scrumApp.shared'])

.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('login', {
            url: '/login', //having this will show up the url in the address bar
            templateUrl: "templates/login/login.html",
            controller: "loginCtrl"
        })
}])

.factory('loginService', ['$http', '$q', function ($http, $q) {

    var LOGIN_ASSOCIATE_URI = 'http://127.0.0.1:8080/ScrumBoard/services/login/';

    var factory = {
        loginAssociate: loginAssociate
    };

    return factory;

    function loginAssociate(associateId) {
        console.log('control in factory method : ', associateId);
        var deferred = $q.defer();

        //This code is only in place to mock Http calls - DO NOT DELETE
        /*if (associateId === "046752") {
            console.log('control inside testing method : ', associateId);
            var associateDetails = {
                "authId": "shfulig{}}#@aelf734769q8rp3278",
                "name": "Arif Akram",
                "id": "046752",
                "role": "admin",
                "projects": [{
                    "projectId": "234567",
                    "projectName": "CareCompass"
                }]
            };
            deferred.resolve(associateDetails);
            return deferred.promise;
        } else {
            deferred.reject("Login call failure");
            return deferred.promise;
        }*/
        //Remove this block before going live

        $http.post(LOGIN_ASSOCIATE_URI, associateId)
            .success(
                function (data, status, headers, config) {
                    if (data.code !== 200) {
                        deferred.reject(data);
                    }
                    console.log('Login Success ', data);
                    deferred.resolve(data);
                })
            .error(
                function (data, status, header, config) {
                    console.log('Login Failure ', status);
                    deferred.reject(data);
                });
        return deferred.promise;
    }

}])

.controller('loginCtrl', ['$scope', '$filter', '$q', 'loginService', '$state', 'SharedService', function ($scope, $filter, $q, loginService, $state, SharedService) {

    console.log('inside login controller');

    navigateToHomeIfAlreadyLoggedIn();

    //function to redirect user to home page if logged in
    function navigateToHomeIfAlreadyLoggedIn() {
        if (SharedService.isUserAuthenticated()) {
            console.log("Navigating to scrum page as user is already logged in : ", SharedService.isUserAuthenticated());
            SharedService.navigateToScurmBoard();
            return;
        }
    }

    //responsible for logging in the user
    $scope.login = function (associateId) {
        console.log('Logging in for .... ', associateId);

        //clear user messages
        $scope.showLoginMessage = false;

        var promise = loginService.loginAssociate(associateId);
        promise.then(function (result) {
                console.log('Login Success, data retrieved :', result);

                //Make the data available to all controllers
                setApplicationLevelData(result);

                //Show success message to the user
                SharedService.showSuccess('Login Successful');

                //Navigate to scrum page
                navigateToHome();
            })
            .catch(function (resError) {
                console.log('LOGIN FAILURE :: ', resError);
                //show failure message to the user
                if (resError.code === 403) {
                    SharedService.showError(resError.message);
                } else {
                    SharedService.showError('Internal Server Error. System could not log you in.');
                }
            });
    }

    //navigates to the home page
    function navigateToHome() {
        console.log('Navigating to scrumboard page');
        //$state.go('scrum');
        SharedService.navigateToScurmBoard();
    }

    //share associate details retured from login success call with all controllers
    function setApplicationLevelData(associateDetails) {
        console.log('Associate details fetched from service call :: ', associateDetails.response[0]);
        //set associate details
        SharedService.setAssociateDetails(associateDetails.response[0]);
        //set auth token
        SharedService.setAuthToken(associateDetails.authToken);
    }

}]);
