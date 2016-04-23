Meteor.publish('songs', function(currentList){
    var currentUser = this.userId;
    return Songs.find({ createdBy: currentUser, listId: currentList })
});



Meteor.methods({
    addSong: function(songTitle){
        check(songTitle, String);
        var currentUser = Meteor.userId();

        data = {
            songTitle: songTitle,
            createdBy: currentUser,
            encore: null,
        }

        if(!currentUser){
            throw new Meteor.Error("not-logged-in", "You're not logged-in.");
        }

        return Songs.insert(data);

    },
    updateSong: function(data){
        if (data.songTitle) check(data.songTitle, String);
        if (data.encore) check(data.encore, String);
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