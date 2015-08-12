Meteor.startup(function() {
    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
});

Accounts.onLogin(function() {
    Meteor.call('loginUser', Meteor.userId());
});

//Tracker.autorun(function () {
//    var user = Meteor.user();
//    if(user) {}
//    else Router.go('login');
//});

Template.layout.created = function() {
    Session.set('attachment', undefined);
};

Template.layout.rendered = function() {
    Dropzone.forElement("#dropzoneDiv").on('success', function(file, response) {
        console.log(response);
        Session.set('attachment', response.filename);
    });
};

Template.layout.helpers({
    currentBusinessName: function() {
        var user = Meteor.user();
        if(user) {
            if(user.profile) return Businesses.findOne(user.profile.businessId).name;
        }
        return '';
    },
    currentBusinessNumber: function() {
        return Session.get('businessNumber');
    },
//    fileAttachType: function() {
//        switch(Session.get('attachType')) {
//            case 'Image': return 'image/*'; break;
//            case 'Video': return 'video/*'; break;
//            case 'Audio': return 'audio/*'; break;
//            case 'Other': 
//            case 'Map': 
//            case 'Contact': 
//                return 'image/*'; 
//                break;
//        }
//    },
    attachImage: function() {
        if(Session.get('attachType') == 'Image') return true;
        else return false;
    },
    attachVideo: function() {
        if(Session.get('attachType') == 'Video') return true;
        else return false;
    },
    attachAudio: function() {
        if(Session.get('attachType') == 'Audio') return true;
        else return false;
    },
    attachOther: function() {
        if(Session.get('attachType') == 'Other') return true;
        else return false;
    },
    attachMap: function() {
        if(Session.get('attachType') == 'Map') return true;
        else return false;
    },
    attachContact: function() {
        if(Session.get('attachType') == 'Contact') return true;
        else return false;
    },
});

Template.menu.events({
    'click #logout': function() {
        Session.set('businessNumber', '');
        Meteor.call('logoutUser', Meteor.userId());
        Meteor.logout();
    }
});

var updateTime = function () {
    var time = moment().format('MMM DD, YYYY hh:mm A');
    Session.set('currentTime', time);
    setTimeout(updateTime, 60 * 1000);
};
updateTime();