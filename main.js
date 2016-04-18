Songs = new Mongo.Collection('songs');
Lists = new Mongo.Collection('lists');


if (Meteor.isClient) {

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
        'checked': function(sticky){
            var isSticky = this.sticky;
            if(isSticky == sticky){
                return "checked";
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
        'change [type=radio]': function(event){
            var songId = this._id;
            var isSticky = $(event.target).val();
            var isntSticky = (isSticky == 'opener') ? 'closer' : 'opener';
            $(event.target).siblings('[value=' + isntSticky + ']').prop('checked', false);
            var currentSticky = Songs.findOne({sticky: isSticky});
            if (currentSticky){
                var data = {
                    _id: currentSticky._id,
                    sticky: null
                }

                Meteor.call('updateSong', data, function(error, results){
                    if(error){
                        console.log(error.reason);
                    }
                });
            }

            var data = {
                _id: songId,
                sticky: isSticky,
            }

            Meteor.call('updateSong', data, function(error, results){
                if(error){
                    console.log(error.reason);
                }
            });
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
            console.log('test');
            $('#login').toggleClass('open');
        }
    });



} // isClient

if (Meteor.isServer){

    function shuffleObject(obj){
        for (var i = 0; i < obj.length - 1; i++) {
            var j = i + Math.floor(Math.random() * (obj.length - i));

            var temp = obj[j];
            obj[j] = obj[i];
            obj[i] = temp;
        }
        return obj;
    }


    function generateList(songs){
        var currentUser = Meteor.userId();
        var sticky = Songs.find({createdBy: currentUser,
            $or: [{
                sticky: 'opener'
            }, {
                sticky: 'closer'
            }]
        }).fetch();

        var allSongs = Songs.find({sticky: null, createdBy: currentUser}).fetch();
        var randomSongs = shuffleObject(allSongs);

        //Trim the list
        if (songs != 0 || songs != ''){
            var l = sticky.length;
            var n = (songs > l) ? songs - l : l;
            var c = randomSongs.length;
            var randomSongs = (c > n) ? randomSongs.slice(0,n) : randomSongs;
        }

        // I don't like this but it's all that's working for me right now
        if (sticky[0].sticky == 'opener'){
            randomSongs.unshift(sticky[0]);
        } else if (sticky[1].sticky == 'opener'){
            randomSongs.unshift(sticky[1]);
        }
        if (sticky[0].sticky == 'closer'){
            randomSongs.push(sticky[0]);
        } else if (sticky[1].sticky == 'closer'){
            randomSongs.push(sticky[1]);
        }

        return randomSongs;
    }


    Meteor.publish('lists', function(){
        var currentUser = this.userId;
        return Lists.find({ createdBy: currentUser });
    });

    Meteor.publish('songs', function(currentList){
        var currentUser = this.userId;
        return Songs.find({ createdBy: currentUser, listId: currentList })
    });

    Meteor.methods({

        createNewList: function(gigDate, numberOfSongs, venueName){
            check(gigDate, String);
            check(venueName, String);
            check(numberOfSongs, Number);

            var currentUser = Meteor.userId();
            var theList = generateList(numberOfSongs);

            var data = {
                  gigDate: gigDate,
                  venueName: venueName,
                  createdBy: currentUser,
                  theList: theList,
            }

            if(!currentUser){
                throw new Meteor.Error("not-logged-in", "You're not logged-in.");
            }

            return Lists.insert(data);

        },
        removeList: function(listId){
            var listId = Lists.findOne(listId);
            var currentUser = Meteor.userId();
            return Lists.remove({ _id: listId._id, createdBy: currentUser });
        },
        addSong: function(songTitle){
            check(songTitle, String);
            var currentUser = Meteor.userId();

            data = {
                songTitle: songTitle,
                createdBy: currentUser,
                sticky: null,
            }

            if(!currentUser){
                throw new Meteor.Error("not-logged-in", "You're not logged-in.");
            }

            return Songs.insert(data);

        },
        updateSong: function(data){
            if (data.songTitle) check(data.songTitle, String);
            if (data.sticky) check(data.sticky, String);
            var songId = Songs.findOne(data._id);
            var currentUser = Meteor.userId();
            return Songs.update({
                _id: songId._id,
                createdBy: currentUser,
            },
            {
                $set: data
            });
        },
        removeSong: function(songId){
            var songId = Songs.findOne(songId);
            var currentUser = Meteor.userId();
            return Songs.remove({ _id: songId._id, createdBy: currentUser });
        }
    });

} // isServer