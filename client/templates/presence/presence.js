Template.presence.helpers({
    onlineAgents: function() {
        return Meteor.users.find({'profile.online': '1', 'profile.businessId': Meteor.user().profile.businessId, _id: {$ne: Meteor.userId()}});
    },
    offlineAgents: function() {
        return Meteor.users.find({'profile.online': '0', 'profile.businessId': Meteor.user().profile.businessId});
    }
});