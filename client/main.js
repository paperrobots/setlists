import '/imports/startup/client';

Songs = new Mongo.Collection('songs');
Lists = new Mongo.Collection('lists');



Template.login.onRendered(function(){
    var validator = $('.login').validate({
        errorPlacement: function(error, element) {
           error.insertBefore(element);
        },
        submitHandler: function(event){
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Meteor.loginWithPassword(email, password, function(error){
                if(error){
                    if(error.reason == "User not found"){
                        validator.showErrors({
                            email: error.reason
                        });
                    }
                    if(error.reason == "Incorrect password"){
                        validator.showErrors({
                            password: error.reason
                        });
                    }
                } else {
                    Router.go("home");
                }
            });
        }
    });
});



Template.register.onRendered(function(){
    var validator = $('.register').validate({
        errorPlacement: function(error, element) {
           error.insertBefore(element);
        },
        submitHandler: function(event){
            var email = $('[name=email]').val();
            var password = $('[name=password]').val();
            Accounts.createUser({
                email: email,
                password: password
            }, function(error){
                if(error){
                    if(error.reason == "Email already exists."){
                        validator.showErrors({
                            email: "That email already belongs to a registered user."
                        });
                    }
                } else {
                    var currentRoute = Router.current().route.getName();
                    if(currentRoute == "login" || currentRoute == "register"){
                        Router.go("songs");
                    }
                }
            });
        }
    });
});


    Template.registerHelper('formatDate', function(date) {
      return moment(date).format('MMMM Do, YYYY');
    });

    Template.navigation.helpers({
        activeIfTemplateIs: function (template) {
          var currentRoute = Router.current();
          return currentRoute &&
            template === currentRoute.lookupTemplate() ? 'active' : '';
        }
      });


    Template.songs.onCreated(function(){
         this.subscribe('songs');
    });

    Template.songs.helpers({
        'song': function(){
            var currentUser = Meteor.userId();
            return Songs.find({createdBy: currentUser}, {sort: {songTitle: 1} } );
        }
    });

    Template.songItem.helpers({
        'checked': function(encore){
            var isEncore = this.encore;
            if(isEncore == encore){
                return "hasEncore";
            } else {
                return "";
            }
        }
    });

    Template.addSong.events({
        'submit form': function(event){
            event.preventDefault();
            var songTitle = $('[name=songTitle]').val();
            Meteor.call('addSong', songTitle, function(error, results){
                if(error){
                    console.log(error.reason);
                } else {
                    $('[name=songTitle]').val('');
                }
            });
        }
    });

    Template.songItem.events({
        'click .delete-song': function(event){
            event.preventDefault();
            var songId = this._id;
            var confirm = window.confirm("Delete this song?");
            if(confirm){
                Meteor.call('removeSong', songId);
            }
        },
        // Update song title inline
        'keyup [name=songItem]': _.debounce(function(event) {
            if(event.which == 13 || event.which == 27){
                $(event.target).blur();
            } else {
                var songId = this._id;
                var songTitle = $(event.target).val();
                var data = {
                    _id: songId,
                    songTitle: songTitle
                }
                Meteor.call('updateSong', data, function(error, results){
                    if(error){
                        console.log(error.reason);
                    }
                });
            }
        }, 500),
        'click .encore': function(event){
            event.preventDefault();
            var isEncore = $(event.target).hasClass('isEncore');
            var songId = this._id;

            if (isEncore == 'encore'){
                $(event.target).toggleClass('hasEncore');
                var data = {
                    _id: songId,
                    encore: null,
                }

                Meteor.call('updateSong', data, function(error, results){
                    if(error){
                        console.log(error.reason);
                    }
                });
            } else {
                $('.hasEncore').removeClass('hasEncore');
                $(event.target).toggleClass('hasEncore');

                var currentEncore = Songs.findOne({encore: 'encore'});
                if (currentEncore){
                    var data = {
                        _id: currentEncore._id,
                        encore: null
                    }

                    Meteor.call('updateSong', data, function(error, results){
                        if(error){
                            console.log(error.reason);
                        }
                    });
                }

                var data = {
                    _id: songId,
                    encore: 'encore',
                }

                Meteor.call('updateSong', data, function(error, results){
                    if(error){
                        console.log(error.reason);
                    }
                });
            }
        }
    });


    Template.lists.onCreated(function(){
         this.subscribe('lists');
    });

    Template.lists.helpers({
        'list': function(){
            var currentUser = Meteor.userId();
            return Lists.find({ createdBy: currentUser }, {sort: {gigDate: -1}});
        }
    });

    Template.lists.events({
        'click .delete-list': function(event){
            event.preventDefault();
            var listId = this._id;
            var confirm = window.confirm("Delete this list?");
            if(confirm){
                Meteor.call('removeList', listId);
            }
        },
    });

    Template.addList.events({
        'submit form': function(event){
            event.preventDefault();
            var gigDate = $('[name=gigDate]').val();
            var numberOfSongs = ($('[name=numberOfSongs]').val() != '') ? parseInt($('[name=numberOfSongs]').val()): parseInt(0);
            var venueName = $('[name=venueName]').val();
            Meteor.call('createNewList', gigDate, numberOfSongs, venueName, function(error, results){
                if(error){
                    console.log(error.reason);
                } else {
                    Router.go('listPage', { _id: results });
                }
            });
        }
    });

    Template.register.events({
        'submit form': function(event){
            event.preventDefault();
        }
    });

    Template.login.events({
        'submit form': function(event){
            event.preventDefault();
        }
    });

    Template.main.events({
        'click .logout': function(event){
            event.preventDefault();
            Meteor.logout();
            Router.go('login');
        },
        'click .toggle-account-menu': function(event){
            event.preventDefault();
            $('#login').toggleClass('open');
        }
    });



