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
    var UPDATE_PASSWORD_URI = 'http://127.0.0.1:8080/ScrumBoard/services/update/password/';
    var REGISTER_ASSOCIATE_URI = 'http://127.0.0.1:8080/ScrumBoard/services/register/';

    var factory = {
        loginAssociate: loginAssociate,
        registerAssociate: registerAssociate,
        updatePassword: updatePassword
    };

    return factory;

    //Login associate
    function loginAssociate(associate) {
        console.log('Associate details for login: ', associate);
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

        $http({
                method: 'POST',
                url: LOGIN_ASSOCIATE_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("associateDetails", angular.toJson(associate));
                    return formData;
                }
            })
            .success(function (data, status, headers, config) {
                console.log('Login Success ', data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Login Failure ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

    //Login associate
    function updatePassword(associate) {
        console.log('Associate details to update ', associate);
        var deferred = $q.defer();
        $http({
                method: 'POST',
                url: UPDATE_PASSWORD_URI,
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("associateDetails", angular.toJson(associate));
                    return formData;
                }
            })
            .success(function (data, status, headers, config) {
                console.log('Update Password Success ', data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Update Password Failure ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

    //Register new associate
    function registerAssociate(associate) {
        console.log('Associate to register : ', associate);
        var deferred = $q.defer();

        $http({
                method: 'POST',
                url: REGISTER_ASSOCIATE_URI,
                params: {
                    isRegistration: true
                },
                headers: {
                    'Content-Type': undefined
                },

                transformRequest: function (data) {
                    var formData = new FormData();
                    formData.append("associateDetails", angular.toJson(associate));
                    return formData;
                }
            })
            .success(function (data, status, headers, config) {
                console.log('Registration Success ', data);
                deferred.resolve(data);
            })
            .error(function (data, status, headers, config) {
                console.log('Registration Failure ', status);
                deferred.reject(data);
            });
        return deferred.promise;
    }

}])

.controller('loginCtrl', ['$scope', '$filter', '$q', 'loginService', '$state', 'SharedService', '$mdDialog', function ($scope, $filter, $q, loginService, $state, SharedService, $mdDialog) {

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

    $scope.shouldUpdatePassword = false;

    //responsible for logging in the user
    $scope.login = function (associate) {
        console.log('Logging in for .... ', associate);

        var promise = loginService.loginAssociate(associate);
        promise.then(function (result) {
                console.log('Login Success, data retrieved :', result);

                if (result.code === 404) {
                    SharedService.showWarning(result.message);
                    //prompt user to update password as it was reset
                    $scope.clearLoginForm();
                    $scope.shouldUpdatePassword = true;
                    $scope.showTab(1);
                    return;
                }
                if (result.code === 403) {
                    SharedService.showError(result.message);
                    return
                }

                if (result.code === 500) {
                    SharedService.showError('Error occurred while logging you in. Please contact administrator');
                    return
                }
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
                SharedService.showError('Internal Server Error. System could not log you in.');
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

    $scope.showTab = function (index) {
        if (index === 1) {
            $scope.isFirstTabActive = true;
            $scope.isSecondTabActive = false;
        } else if (index === 2) {
            $scope.isFirstTabActive = false;
            $scope.isSecondTabActive = true;
        }
    }

    //responsible for updating user password
    $scope.updatePwd = function (associate) {

        if (associate.associateId === associate.password) {
            notifyUser('Your Password cannot be same as your ID');
            return;
        }

        console.log('Updating for .... ', associate);

        var promise = loginService.updatePassword(associate);
        promise.then(function (result) {
                console.log('update success, data retrieved :', result);

                if (result.code === 404) {
                    SharedService.showWarning(result.message);
                    return;
                }

                if (result.code === 500) {
                    SharedService.showError('Error occurred while logging you in. Please contact administrator');
                    return
                }
                //Show success message to the user
                SharedService.showSuccess(result.message);

                //clear register form
                $scope.clearLoginForm();

                $scope.shouldUpdatePassword = false;
            })
            .catch(function (resError) {
                console.log('LOGIN FAILURE :: ', resError);
                //show failure message to the user
                SharedService.showError('Internal Server Error. System could not log you in.');
            });
    }

    //Register the user such that he can login
    $scope.register = function (associate) {
        console.log('user to be registerd is ', associate);
        if ($scope.registerForm.$valid) {

            if (associate.associateId === associate.password) {
                notifyUser('Your Password cannot be same as your ID');
                return;
            }

            if (associate.password !== associate.confirmedPassword) {
                notifyUser('Passwords do not match. Please verify and re-submit.');
                return;
            }

            //remove the below property before calling server
            delete associate.confirmedPassword;

            //call server to register new associate
            var promise = loginService.registerAssociate(associate);
            promise.then(function (result) {
                    console.log('Registration Success, data retrieved :', result);

                    if (result.code === 404) {
                        SharedService.showWarning(result.message);
                        return;
                    }
                    if (result.code === 403) {
                        SharedService.showError(result.message);
                        return
                    }

                    if (result.code === 500) {
                        SharedService.showError('Error occurred while logging you in. Please contact administrator');
                        return
                    }

                    //Show success message to the user
                    SharedService.showSuccess(result.message + '. You can now login');

                    //show first tab
                    $scope.showTab(1);

                    //clear register form
                    $scope.clearRegisterForm();
                })
                .catch(function (resError) {
                    console.log('LOGIN FAILURE :: ', resError);
                    //show failure message to the user
                    SharedService.showError('Internal Server Error. System could not register you.');
                });

        } else {
            console.log('form is invalid');
            //notify user to correct the form data before submitting
            notifyUser('Please fill in all the fields to register.');
            return;
        }
    }

    //Clear login form
    $scope.clearLoginForm = function () {
        $scope.associate = undefined;
        $scope.shouldUpdatePassword = false;
        $scope.loginForm.$setPristine();
        $scope.loginForm.$setUntouched();
    }

    //Clear registerForm fields
    $scope.clearRegisterForm = function () {
        $scope.associate = undefined;
        $scope.registerForm.$setPristine();
        $scope.registerForm.$setUntouched();
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
