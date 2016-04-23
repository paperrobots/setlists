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

Template.login.events({
    'submit form': function(event){
        event.preventDefault();
    }
});