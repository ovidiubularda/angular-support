(function () {
    'use strict';

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        var header = {
            templateUrl: 'js/header/header.html',
            controller: 'HeaderCtrl',
            controllerAs: 'header'
        };
        var footer = {
            templateUrl: 'js/footer/footer.html',
            controller: 'FooterCtrl',
            controllerAs: 'footer'
        };
        var sidebar = {
            templateUrl: 'js/sidebar/sidebar.html',
            controller: 'SidebarCtrl',
            controllerAs: 'sidebar'
        };

        $stateProvider
            .state('root', {
                url: '',
                abstract: true,
                views: {
                    'main@': {
                        templateUrl: 'js/main/main.html',
                        controller: 'MainCtrl',
                        controllerAs: 'main'
                    }
                }
            })
            .state('root.index', {
                url: '/',
                views: {
                    content: {
                        templateUrl: 'js/home/home.html',
                        controller: 'HomeCtrl',
                        controllerAs: 'home'
                    },
                    sidebar: sidebar,
                    header: header,
                    footer: footer
                }
            });

    }

    angular.module('routes', ['ui.router', 'ui.router.title']).config(config);
})();
