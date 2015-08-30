angular.module('todosApp', ['LocalStorageModule', 'firebase']);

angular
    .module('todosApp')

    .factory('FirebaseStorage', ['$firebaseArray', function($firebaseArray){

        var connection = new Firebase('https://zz-to-dos.firebaseio.com/');
        var todos = $firebaseArray(connection);

        return {
            getAll: function() {
                return todos;
            },
            saveAll: function() {
                todos.forEach(function(todo){
                    todos.$save(todo);
                });
            },
            deleteTodo: function(todo) {
                todos.$remove(todo);
            },
            insertTodo: function(todo) {
                todos.$add(todo);
            },
            updateTodo: function(todo) {
                console.log(todo)
                todos.$save(todo);
            }
        }
    }])

    .factory('LocalStorage', ['localStorageService', function(localStorageService){

        var todos = localStorageService.get('todos') || [];

        return {
            getAll: function() {
                return todos;
            },
            saveAll: function() {
                localStorageService.set('todos',todos);
            },
            deleteTodo: function(todo) {
                var index = todos.indexOf(todo);
                todos.splice(index, 1);
                this.saveAll();
            },
            insertTodo: function(todo) {
                todos.push(todo);
                this.saveAll();
            },
            updateTodo: function(todo) {
                this.saveAll();
            }
        }
    }])

    .factory('ArrayStorage',function(){

        var todos = [
            {
                title : 'Buy Milk',
                done : false,
                editing: false
            },
            {
                title : 'Buy Eggs',
                done : false,
                editing: false
            },
            {
                title : 'Buy Flour',
                done : false,
                editing: false
            }
        ];

    return {
            getAll: function(){
                return todos
            },
            saveAll: function(){},
            deleteTodo: function(todo){
                var index = todos.indexOf(todo);
                todos.splice(index,1);
                this.saveAll();
            },
            insertTodo: function(todo){
                todos.push(todo);
            },
            updateTodo: function(todo){}
        }
    })

    .factory('storage', ['ArrayStorage', 'LocalStorage', 'FirebaseStorage', function(ArrayStorage, LocalStorage, FirebaseStorage){
        // use Firebase to store to do data instead of localStorage and arrayStorage
        return FirebaseStorage;
    }])

    .controller('TodosController', ['$scope','$window','$timeout','storage', function($scope, $window, $timeout, storage) {
        $scope.todos = storage.getAll();

        $scope.setEditing =  function(todo){
        	todo.editing = true;
            storage.saveAll();
        }

        $scope.updateTodo = function (todo, $event) {
            if($event.keyCode == 27) {
                todo.editing = false;
                storage.updateTodo(todo);
            } else if ($event.keyCode == 13) {
                todo.title = $event.target.value,
                todo.editing = false,
                storage.updateTodo(todo)
            }
        }

        $scope.insertTodo = function($event) {
            if($event.keyCode == 27) {
                $event.target.value = '';
            } else if ($event.keyCode == 13) {
                storage.insertTodo({
                    title: $event.target.value,
                    editing: false,
                    done: false,
                })
                $event.target.value = '';
            }
        }

        $scope.deleteTodo = function(todo){
            storage.deleteTodo(todo);
        }

        $scope.getPendingTodos = function(){
            return $scope.todos.filter(function(item){
                return item.done == false;
            })
        }
        $scope.massToggleTodos = function(){
            $scope.todos.forEach(function(todo){
                todo.done = $scope.allDoneFlag;
            })
            storage.saveAll();
        }
        $scope.clearAllTodos = function(){
            $scope.todos.forEach(function(todo){
                if(todo.done) {
                    $scope.deleteTodo(todo);
                }
            })
        }

        $scope.saveTodo = function(){
            storage.saveAll();
        }

        $window.onhashchange = function(){
            $scope.state = this.location.hash.substr(2);
            switch($scope.state) {
                case '' :
                    $scope.todoFilter = {};
                    break;
                case 'active': 
                    $scope.todoFilter = {done: false};
                    break;
                case 'completed': 
                    $scope.todoFilter = {done: true};
                    break;
            }
            $scope.$apply();
        }
        $timeout($window.onhashchange, 1);
    }])