Template.login.events({
    'submit #wf-form-login': function(event) {
        event.preventDefault();
        var loginUsername = event.target.loginUsername.value;
        var loginPassword = event.target.loginPassword.value;
        Meteor.loginWithPassword(loginUsername, loginPassword, function(err) {
            if(err) {
                event.target.loginUsername.value = '';
                event.target.loginPassword.value = '';
            } else Router.go('mobileLogin');
        });
    }
});

Template.businessNumberLogin.events({
    'submit #mobile-login-form': function(event) {
        event.preventDefault();
        var phoneNumber = event.target.phoneNumber.value.replace(/\D/g,'');
        if(phoneNumber.length == 10) {
            Meteor.call('checkBusinessNumber', Meteor.userId(), '+1' + phoneNumber, function(err, data) {
                if(data == '1') {
                    Session.set('businessNumber', '+1' + phoneNumber);
                    Router.go('interactions');
                } else alert('Business Number Not Found')
            });
        } else alert('Invalid Business Number');
    }
});