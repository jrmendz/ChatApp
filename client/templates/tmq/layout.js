Template.tmqMenu.events({
    'click #logout': function() {
        Meteor.call('logoutUser', Meteor.userId());
        Meteor.logout();
    },
});