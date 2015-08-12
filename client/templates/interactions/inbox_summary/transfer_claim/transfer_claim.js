Template.transferClaim.rendered = function() {
    $("#transferClaimForm .agents-list").select2({
        placeholder: "Select an agent...",
        allowClear: true
    });
};

Template.transferClaim.helpers({
    agents: function() {
        return Meteor.users.find({'profile.businessId': Meteor.user().profile.businessId, _id: {$ne: Meteor.userId()}});
    },
});

Template.transferClaim.events({
    'submit #transferClaimForm': function (event) {
        event.preventDefault();
        if(confirm('Approval required, an invite will be sent to the agent. Send Invite?')) {
            Meteor.call('transferClaim', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, Meteor.userId(), event.target.agentsList.value);
            var interaction = {
                businessNumber: Session.get('businessNumber'),
                message: 'Transfer claim initiated by ' + Meteor.user().username,
                attachment: null,
                groupId: '',
                consumerNumber: Session.get('currentConsumerInfo').number,
            };

            Meteor.call('insertInteraction', interaction);
            $('#transferClaimModal').modal('hide')
        }
    }
});