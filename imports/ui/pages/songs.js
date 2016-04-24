import './songs.html';


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