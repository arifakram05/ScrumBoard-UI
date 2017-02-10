'use strict';

angular.module('scrumApp.project', ['ui.router'])

.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('project', {
            //url: "/project",
            templateUrl: "templates/project/project.html",
            controller: "projectCtrl"
        })
})

/*.factory('projectService', ['$http', '$q', function ($http, $q) {



    }])*/

.controller('projectCtrl', ['$scope', '$filter', '$mdDialog', '$q', function ($scope, $filter, $mdDialog, $q) {

    console.log('inside scrum controller');

    showProjectModal();

    function showProjectModal() {
        $('#project_page_modal').modal('show');
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
