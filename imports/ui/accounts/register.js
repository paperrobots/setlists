import './register.html';

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


Template.register.events({
    'submit form': function(event){
        event.preventDefault();
    }
});