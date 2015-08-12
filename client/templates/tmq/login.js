Template.tmqLogin.events({
    'submit #wf-form-login': function(event) {
        event.preventDefault();
        var loginUsername = event.target.loginUsername.value;
        var loginPassword = event.target.loginPassword.value;
        Meteor.loginWithPassword(loginUsername, loginPassword, function(err, user) {
            if(user) Router.go('tmqBusinesses');
            else {
                event.target.loginUsername.value = '';
                event.target.loginPassword.value = '';
            }
        });
    }
});