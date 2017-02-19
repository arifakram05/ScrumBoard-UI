angular.module('scrumApp.logout', ['ui.router', 'scrumApp.shared'])

.config(['$stateProvider', function ($stateProvider) {
    $stateProvider
        .state('logout', {
            controller: "logoutCtrl"
        })
    }])

/*.factory('logoutService', ['$http', '$q', function ($http, $q) {

    var LOGOUT_ASSOCIATE_URI = 'http://127.0.0.1:8080/ScrumBoard/logout/';

    var factory = {
        logoutAssociate: logoutAssociate
    };

    return factory;

    function logoutAssociate(associateId) {
        console.log('control in factory method to logout associate : ',associateId);
        var deferred = $q.defer();

        //This code is only in place to mock Http calls
        if (associateId === "046752") {
            console.log('control inside logout testing method : ', associateId);
            var scrumResponse = {
                "success": "true",
                "code": "200"
            };
            deferred.resolve(scrumResponse);
            return deferred.promise;
        } else {
            deferred.reject("Logout call failure");
            return deferred.promise;
        }
        //Remove this block before going live

        $http.post(LOGOUT_ASSOCIATE_URI, associateId)
            .success(
                function (data, status, headers, config) {
                    console.log('Logout Success ', data);
                    deferred.resolve(data);
                })
            .error(
                function (data, status, header, config) {
                    console.log('Logout Failure ', status);
                    deferred.reject(data);
                });
        return deferred.promise;
    }

}])*/

.controller('logoutCtrl', ['$scope', '$q', 'SharedService', function ($scope, $q, SharedService) {

    console.log('inside logout controller');

    logout();

    //responsible for logging out the user
    function logout() {
        var associateId = SharedService.getAssociateId();

        console.log('Logging out for .... ', associateId);

        //logout user
        SharedService.logout();

        //Navigate to login page
        navigateToLogin();

        /*var promise = logoutService.logoutAssociate(associateId);
        promise.then(function (result) {
                console.log('Logout Success, data retrieved : ', result);


            })
            .catch(function (resError) {
                console.log('LOGOUT FAILURE :: ', resError);
                SharedService.showError('We are sorry. Something went wrong! Could not log you out.');
            });*/
    }

    //Tell the shared module to navigate the user to login page
    function navigateToLogin() {
        SharedService.showLoginPage();
    }

}]);
