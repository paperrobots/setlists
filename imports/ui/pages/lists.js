import './lists.html';

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