angular.module('scrumApp.shared', ['ui.router'])

.service('SharedService', ['$state', 'growl', '$http', '$q', '$window', function ($state, growl, $http, $q, $window) {

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
        getAssignedProjects: getAssignedProjects,

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
        //console.log('Associate details now set :: ', this.associateDetails);
        $window.localStorage.setItem('sbAssociateDetails', JSON.stringify(associateDetails));
    }

    function getAssociateDetails() {
        if ($window.localStorage.getItem('sbAssociateDetails')) {
            this.associateDetails = JSON.parse($window.localStorage.getItem('sbAssociateDetails'));
        }
        return this.associateDetails;
    }

    function setAuthToken(authToken) {
        this.authToken = authToken;
        //console.log('token set : ', this.authToken);
        $window.localStorage.setItem('sbAuthToken', authToken);
    }

    function getAuthToken() {
        this.authToken = $window.localStorage.getItem('sbAuthToken');
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

    function getAssignedProjects() {
        return this.associateDetails.projects;
    }

    function showLoginPage() {
        //console.log('Inside Shared Controller"s showLoginPage method');
        $state.go('login');
    }

    function navigateToScurmBoard() {
        //console.log('Inside Shared Controller"s NavigateToScurmBoard method');
        $state.go('scrum');
    }

    function isUserAuthenticated() {
        var localAssociateDetails = JSON.parse($window.localStorage.getItem('sbAssociateDetails'));
        var localToken = $window.localStorage.getItem('sbAuthToken');
        if (localAssociateDetails != null && localToken !== '')
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
        this.authToken = '';
        $window.localStorage.removeItem('sbAssociateDetails');
        $window.localStorage.removeItem('sbAuthToken');
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
                    console.log('Fetched all projects: ', response);
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
