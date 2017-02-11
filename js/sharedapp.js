angular.module('scrumApp.shared', ['ui.router'])

.service('SharedService', ['$state', function ($state) {

    this.associateDetails = {};

    var service = {
        setAssociateDetails: setAssociateDetails,
        getAssociateDetails: getAssociateDetails,

        getAssociateName: getAssociateName,
        getAssociateId: getAssociateId,
        getAuthId: getAuthId,
        getUserRole: getUserRole,

        showLoginPage: showLoginPage,
        navigateToScurmBoard: navigateToScurmBoard,
        isUserAuthenticated: isUserAuthenticated,
        verifyUserAndRedirect: verifyUserAndRedirect,

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

    function getAssociateName() {
        return associateDetails.name;
    }

    function getAssociateId() {
        return this.associateDetails.id;
    }

    function getAuthId() {
        return this.associateDetails.authId;
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
        if (this.associateDetails !== undefined)
            return true;
        else
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

}]);
