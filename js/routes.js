(function() {
    'use strict';

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');
    }

    angular.module('routes', ['ui.router', 'ui.router.title']).config(config);
    
})();
