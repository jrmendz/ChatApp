Meteor.startup(function () {
    smtp = {
        username: 'pauline@txtmeQuick.com',
        password: 'dutchezblu08',
        server:   'mail.txtmeQuick.com',
        port: 26
    }

    process.env.MAIL_URL = 'smtp://' + encodeURIComponent(smtp.username) + ':' + 
    encodeURIComponent(smtp.password) + '@' + encodeURIComponent(smtp.server) + ':' + smtp.port;
    
});
Meteor.setInterval(function(){Meteor.serverFn.checkEventSchedules()}, 1 * 60 * 1000);

Accounts.validateLoginAttempt(function(attempt) {
    if(attempt.allowed) {
        if(attempt.user.profile.type == 'agent' && attempt.user.profile.retired == '1') throw new Meteor.Error('agent-retired', 'Access Denied.');
        else return true;
    } return false;
});