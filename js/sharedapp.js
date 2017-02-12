angular.module('scrumApp.shared', ['ui.router'])

.service('SharedService', ['$state', 'growl', function ($state, growl) {

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

        logout: logout
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
        growl.success(message, {title: 'Success!'});
    }

    function showWarning(message) {
        growl.warning(message, {title: 'Warning!'});
    }

    function showError(message) {
        growl.error(message, {title: 'Error!'});
    }

    function showInfo(message) {
        growl.info(message, {title: 'Info!'});
    }

}]);
