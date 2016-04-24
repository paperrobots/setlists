import './body.html';
import '../components/navigation.js';
import '../pages/songs.js';
import '../pages/lists.js';
import '../accounts/login.js';
import '../accounts/register.js';


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