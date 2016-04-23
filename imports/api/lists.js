import './songs.js';

/**
 * Shuffles an object into a random order
 * @param {object} obj Songs Object
 * @return {object}  obj Object
 */
function shuffleObject(obj){
    for (var i = 0; i < obj.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (obj.length - i));

        var temp = obj[j];
        obj[j] = obj[i];
        obj[i] = temp;
    }
    return obj;
}

/**
 * Generates a random setlist based on chosen number of songs
 * @param  {String - songs} songs
 * @return {Array - randomSongs}  Randomized Array of Songs
 */
function generateList(songs){
    var currentUser = Meteor.userId();
    var encore = Songs.find({createdBy: currentUser,  encore: 'encore'}).fetch();
    var allSongs = Songs.find({encore: null, createdBy: currentUser}).fetch();
    var randomSongs = shuffleObject(allSongs);

    //Trim the list to the specified amount of songs
    if (songs != 0 || songs != ''){
        var l = encore.length;
        var n = (songs > l) ? songs - l : l;
        var c = randomSongs.length;
        var randomSongs = (c > n) ? randomSongs.slice(0,n) : randomSongs;
    }

    // Throw the encore on the end of the list
    if (encore[0].encore == 'encore'){
        randomSongs.push(encore[0]);
    }

    return randomSongs;
}


Meteor.publish('lists', function(){
    var currentUser = this.userId;
    return Lists.find({ createdBy: currentUser });
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
    }
});
