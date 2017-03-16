'use strict';

(function () {
    'use strict';
    /*@ngInject*/
    function sidebarController($log, $state) {
        / jshint validthis: true /
        var ctrl = this;
        ctrl.isLoggedIn = isLoggedIn;
        ctrl.login = login;
        ctrl.logout = logout;
        ctrl.logoSrc = '';

        /**
         * @ngdoc method
         * @name HeaderCtrl#isLoggedIn
         * @methodOf HeaderCtrl
         * @example
         * <pre><button class="btn btn-default" type="button" ng-click="header.login()" ng-if="!header.isLoggedIn()">
         * {{'Se connecter' | translate }}
         * </button></pre>
         * @description checks if the user is logged in
         */
        function isLoggedIn() {
            return LoginService.getJWTToken();
        }

        /**
         * @ngdoc method
         * @name HeaderCtrl#login
         * @methodOf HeaderCtrl
         * @example
         * <pre><button ng-click="header.login()">Se connecter</button></pre>
         * @description shows the login modal
         */
        function login() {
            Modals.login()
                .then(function () {
                    $state.go('root.requests');
                });
        }

        /**
         * @ngdoc method
         * @name HeaderCtrl#logout
         * @methodOf HeaderCtrl
         * @example
         * <pre><li role="menuitem"><a ng-click="header.logout()">{{::'Me déconnecter'}}</a></li></pre>
         * @description logs the user out and redirects to index
         */
        function logout() {
            LoginService.logout()
                .then(function success() {
                    $state.go('index');
                }, function error(err) {
                    $log.error('error logging out' + err);
                });
        }

    }

    /**
     * @ngdoc controller
     * @name HeaderCtrl
     * @description The header controller
     * @name HeaderCtrl
     * @requires $log
     * @requires $state
     * @requires LoginService
     * @requires logoSources
     * @requires Modals
     * @property {String} logoSrc - the logo source
     */
    angular.module('support').controller('SidebarCtrl', sidebarController);
}());