var app = angular.module('app', ['ngMaterial']);

app.controller('MainCtrl', function ($scope, $timeout, $q, $http, $mdToast) {

  $scope.dataset = 'small';

  function toast(message) {
    $mdToast.show(
      $mdToast.simple()
        .position('top right')
        .textContent(message)
        .hideDelay(2000)
    );
  }

  $scope.search = function(q) {
    var d = $q.defer();
    $http.get('http://54.77.168.95:3000/search?q=' + q + '&dataset=' + $scope.dataset)
      .then(function(res) {
        console.log('fetched', res.data);
        d.resolve(res.data);
        if (res.data.length == 0) $scope.errorMessage = "No cities matching '" + $scope.searchText + "' were found";
      })
      .catch(function(err) {
        console.log('error', err);
        d.resolve([]);
        $scope.errorMessage = err.data.message;
        toast(err.data.message);
      });
    return d.promise;
  };

})
