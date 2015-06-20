var myapp = angular.module('myapp', ['ngRoute']);

myapp.config(['$routeProvider',
      function ($routeProvider) {
          $routeProvider.
            when('/list', {
                templateUrl: 'list.html',
                controller: 'newsListCtrl'
            }).
            when('/listlocations', {
                templateUrl: 'listlocations.html',
                controller: 'listLocationsCtrl'
            }).
            when('/detail/:storyId', {
                templateUrl: 'detail.html',
                controller: 'newsDetailCtrl'
            }).
            when('/new', {
                templateUrl: 'new.html',
                controller: 'newsNewItemCtrl'
            }).
            otherwise({
                redirectTo: '/list'
            });
      }]);

myapp.factory('stories', function ($http) {
    var downloadedStories = [];

    return function () {
        return downloadedStories;
    };
});

myapp.factory('locations', function ($http) {
    var downloadedLocations = [];

    return function () {
        return downloadedLocations;
    };
});

myapp.controller('newsNewItemCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.submit = function () {
        var paras = {
            method: 'POST',
            data: $scope.news,
            url: 'http://geonews.azurewebsites.net/api/NewsItem'
        };
        $http(paras).success(function () {
            $scope.news.HeadLine = '';
        });
    };
}]);

myapp.controller('listLocationsCtrl', ['$scope', '$http', 'locations',
    function ($scope, $http, locations) {
        var l = locations();
        if (l.length == 0) {
            $http.get('http://geonews.azurewebsites.net/api/Location')
                    .success(function (data) {
                        l.push({ id:24, name: "Te Papa" });
                        for (var i = 0; i < data.length; i++) {
                            l.push(data[i]);
                        }
                    });
                    // .fail(function () {
                    //     l.push({ id:24, name: "Te Papa" });
                    // });
                    l.push({ id: 23, name: "TSB Arena" });
        }
        $scope.locations = l;
        $scope.delete = function (storyId) {
            var url = 'http://geonews.azurewebsites.net/api/Location/' + storyId;
            $http.delete(url).success(function () {
                var arrayb = l;
                l = [];
                for (var i = 0; i < arrayb.length; i++) {
                    if (arrayb[i].id != storyId) {
                        l.push(arrayb[i]);
                    }
                }
            });
        };
    }
]);

myapp.controller('newsListCtrl', ['$scope', '$http', 'stories',
    function ($scope, $http, stories) {
        var s = stories();
        if (s.length == 0) {
            $http.get('http://geonews.azurewebsites.net/api/NewsItem')
                    .success(function (data) {
                        for (var i = 0; i < data.length; i++) {
                            s.push(data[i]);
                        }
                    });
        }
        $scope.stories = s;
        $scope.delete = function (storyId) {
            var url = 'http://geonews.azurewebsites.net/api/NewsItem/' + storyId;
            $http.delete(url).success(function () {
                var arrayb = s;
                s = [];
                for (var i = 0; i < arrayb.length; i++) {
                    if (arrayb[i].id != storyId) {
                        s.push(arrayb[i]);
                    }
                }
            });
        };
    }
]);

myapp.controller('newsDetailCtrl', ['$scope', '$http', '$routeParams', 'stories',
    function ($scope, $http, $routeParams, stories) {
        var s = stories();
        $scope.story = s[0];
        $scope.newParagraph = "Hi, I'm a new paragraph";
        for (var i = 0; i < s.length; i++) {
            if (s[i].id == $routeParams.storyId) {
                $scope.story = s[i];
            }
        }

        $scope.removeAll = function () {
            var url = 'http://geonews.azurewebsites.net/api/Paragraph/' + $scope.story.id;
            $http.delete(url).success(function () {
                $scope.story.paragraphs = [];
            });
        };

        $scope.addParagraph = function () {
            var url = 'http://geonews.azurewebsites.net/api/Paragraph?storyId=' + $scope.story.id + '&paragraphText=' + encodeURI($scope.newParagraph);
            console.log(url);
            $http.post(url).success(function () {
                $scope.story.paragraphs.push($scope.newParagraph);
                $scope.newParagraph = '';
            }).error(function () {
                console.log('Fucked up');
            });
        };
    }
]);