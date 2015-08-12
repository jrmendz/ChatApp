Template.groupConversation.rendered = function() {
    $("#groupConversationForm .agents-list").select2();
    $("#groupConversationForm .consumers-list").select2();
};

Template.groupConversation.helpers({
    agents: function() {
        return Meteor.users.find({'profile.businessId': Meteor.user().profile.businessId, _id: {$ne: Meteor.userId()}});
    },
    consumers: function() {
        var businessId = Meteor.user().profile.businessId;
        var consumers = Consumers.find({'identity.businessId': businessId}).fetch();
        var consumersList = [];
        var existingConsumers = [];
        for(var x = 0; x < consumers.length; x++) {
            var consumer = consumers[x];
            for(var y = 0; y < consumer.identity.length; y++) {
                var identity = consumer.identity[y];
                if(Session.get('currentConsumerInfo') && 
                   identity.businessId == businessId && 
                   identity.isEmployee != '1' &&
                   ((Session.get('groupId') == null && consumer.mobile_number != Session.get('currentConsumerInfo').number) || Session.get('groupId'))
                   && $.inArray(consumer.mobile_number, existingConsumers) === -1) {
                    existingConsumers.push(consumer.mobile_number);
                    consumersList.push({
                        firstName: identity.first,
                        lastName: identity.last,
                        mobileNumber: consumer.mobile_number,
                    });
                }
            }
        }
        return consumersList;
    },
});

Template.groupConversation.events({
    'submit #groupConversationForm': function (event) {
        event.preventDefault();
        var groupId = Session.get('groupId');
        var agents = $("#groupConversationForm .agents-list").val();
        agents.push(Meteor.userId());
        var consumers = $("#groupConversationForm .consumers-list").val();
        if(groupId) Meteor.call('updateGroupConversation', groupId, {agents: agents, consumers: consumers});
        else {
            consumers.push(Session.get('currentConsumerInfo').number);
            Meteor.call('insertGroupConversation', Session.get('businessNumber'), Meteor.userId(), agents, consumers);
        }
        $('#groupConversationModal').modal('hide');
    }
});