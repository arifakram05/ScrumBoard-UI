angular.module('scrumApp.shared', ['ui.router'])

.service('SharedService', ['$state', 'growl', '$http', '$q', function ($state, growl, $http, $q) {

    var GET_ALL_PROJECTS_URI = 'http://127.0.0.1:8080/ScrumBoard/services/projects/';

    this.associateDetails = {};
    this.authToken = '';

    var service = {
        setAssociateDetails: setAssociateDetails,
        getAssociateDetails: getAssociateDetails,

        setAuthToken: setAuthToken,
        getAuthToken: getAuthToken,

        getAssociateName: getAssociateName,
        getAssociateId: getAssociateId,
        getUserRole: getUserRole,

        showLoginPage: showLoginPage,
        navigateToScurmBoard: navigateToScurmBoard,
        isUserAuthenticated: isUserAuthenticated,
        isUserAdmin: isUserAdmin,
        verifyUserAndRedirect: verifyUserAndRedirect,

        showSuccess: showSuccess,
        showWarning: showWarning,
        showError: showError,
        showInfo: showInfo,

        logout: logout,

        //service calls
        getAllProjects: getAllProjects
    };

    return service;

    function setAssociateDetails(associateDetails) {
        this.associateDetails = associateDetails;
        console.log('Associate details now set :: ', this.associateDetails);
    }

    function getAssociateDetails() {
        return this.associateDetails;
    }

    function setAuthToken(authToken) {
        this.authToken = authToken;
        console.log('token set : ', this.authToken);
    }

    function getAuthToken() {
        return this.authToken;
    }

    function getAssociateName() {
        return this.associateDetails.associateName;
    }

    function getAssociateId() {
        return this.associateDetails.associateId;
    }

    function getUserRole() {
        return this.associateDetails.role;
    }

    function showLoginPage() {
        console.log('Inside Shared Controller"s showLoginPage method');
        $state.go('login');
    }

    function navigateToScurmBoard() {
        console.log('Inside Shared Controller"s NavigateToScurmBoard method');
        $state.go('scrum');
    }

    function isUserAuthenticated() {
        if (this.associateDetails !== undefined && this.authToken !== '')
            return true;
        else
            return false;
    }

    function isUserAdmin() {
        if (isUserAuthenticated() && getUserRole() === 'admin') {
            return true;
        } else
            return false;
    }

    //verify if user if authenticated, if not redirect to home page
    function verifyUserAndRedirect() {
        if (!isUserAuthenticated()) {
            console.log('User is not authorized to view ScrumBoard, redirecting to Login page');
            showLoginPage();
        }
    }

    //logout user
    function logout() {
        this.associateDetails = undefined;
    }

    /*Messages to the user*/
    function showSuccess(message) {
        growl.success(message, {
            title: 'Success!'
        });
    }

    function showWarning(message) {
        growl.warning(message, {
            title: 'Warning!'
        });
    }

    function showError(message) {
        growl.error(message, {
            title: 'Error!'
        });
    }

    function showInfo(message) {
        growl.info(message, {
            title: 'Info!'
        });
    }


    //Common service calls
    function getAllProjects() {
        var deferred = $q.defer();
        $http({
                method: 'GET',
                url: GET_ALL_PROJECTS_URI
            })
            .then(
                function success(response) {
                    console.log('Fetched all projects: ',response);
                    if (response.data.code === 200) {
                        deferred.resolve(response.data);
                    } else {
                        deferred.reject(response);
                    }
                },
                function error(errResponse) {
                    console.error('Error while making service call to fetch scrum details ', errResponse);
                    deferred.reject(errResponse);
                }
            );
        return deferred.promise;
    }

}]);
