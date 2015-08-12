Template.broadcast.created = function() {
    Session.set('mode', 'send');
};

Template.broadcast.rendered = function() {
    $("#groupForm .consumers-list").select2();
};

Template.broadcast.helpers({
    broadCastHeading: function() {
        var broadcastMode = Session.get('mode');
        if(broadcastMode == 'add') return '<i class="fa fa-plus"></i>&nbsp;Add Group';
        else if(broadcastMode == 'edit') return '<i class="fa fa-edit"></i>&nbsp;Edit Group';
        else if(broadcastMode == 'send') return '<i class="fa fa-send"></i>&nbsp;Broadcast Message';
    },
    sendBroadcast: function() {
        if(Session.get('mode') == 'send') return true;
        else return false;
    },
    consumersList: function() {
        var businessId = Meteor.user().profile.businessId;
        var consumers = Consumers.find({'identity.businessId': businessId}).fetch();
        var consumersList = [];
        for(var x = 0; x < consumers.length; x++) {
            var consumer = consumers[x];
            for(var y = 0; y < consumer.identity.length; y++) {
                var identity = consumer.identity[y];
                if(identity.businessId == businessId && identity.isEmployee != '1') {
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
    groupsList: function() {
        var businessConsumerGroups = ConsumerGroups.findOne({businessId: Meteor.user().profile.businessId});
        console.log(businessConsumerGroups);
        if(businessConsumerGroups) return businessConsumerGroups.groups;
        else return [];
    },
    consumerDetails: function(number) {
        var consumer = Consumers.findOne({mobile_number: number});
        var identity = null;
        for(var x = 0; x < consumer.identity.length; x++) {
            if(consumer.identity[x].businessId == Meteor.user().profile.businessId) identity = consumer.identity[x];
        }
        return identity.first + ' ' + identity.last + ' - ' + number;
    },
});

Template.broadcast.events({
    'click .add-group': function() {
        Session.set('mode', 'add');
        $('#groupForm').show();
        $('#sendBroadcastForm').hide();
        $('#groupForm #name').val('');
        $("#groupForm .consumers-list").select2('val', []);
    },
    'click .edit-group': function(event) {
        Session.set('mode', 'edit');
        Session.set('groupIdx', event.currentTarget.dataset.idx);
        var group = ConsumerGroups.findOne({businessId: Meteor.user().profile.businessId}).groups[event.currentTarget.dataset.idx];
        console.log(group);
        $('#groupForm').show();
        $('#sendBroadcastForm').hide();
        $('#groupForm #name').val(group.name);
        $('#groupForm .consumers-list').select2('val', group.consumers);
    },
    'click .remove-group': function(event) {
        if(confirm('Are you sure you want to delete this group?')) {
            Meteor.call('removeGroup', Meteor.user().profile.businessId, event.currentTarget.dataset.idx);
        }
    },
    'click .send-broadcast': function(event) {
        Session.set('mode', 'send');
        Session.set('groupIdx', event.currentTarget.dataset.id);
        $('#groupForm').hide();
        $('#sendBroadcastForm').show();
        $('#sendBroadcastForm #message').val('');
        $("#sendBroadcastForm input.consumer:checked").prop('checked', false);
    },
    'change .consumer-group': function(event) {
        var groupId = event.currentTarget.dataset.id;
        if($(event.target).is(':checked')) $('input.consumer[data-groupid="' + groupId + '"]').prop('checked', true);
        else $('input.consumer[data-groupid="' + groupId + '"]').prop('checked', false);
    },
    'submit #groupForm': function(event) {
        event.preventDefault();
        var broadcastMode = Session.get('mode');
        var values = {
            name: $('#groupForm #name').val(),
            consumers: $('#groupForm .consumers-list').val(),
            businessId: Meteor.user().profile.businessId
        };
        if(broadcastMode == 'add') Meteor.call('insertGroup', Meteor.user().profile.businessId, values);
        else if(broadcastMode == 'edit') Meteor.call('updateGroup', Meteor.user().profile.businessId, Session.get('groupIdx'), values);
        
        alert('Group Saved.');
        $('#groupForm #name').val('');
        $("#groupForm .consumers-list").select2('val', []);
    },
    'submit #sendBroadcastForm': function(event) {
        event.preventDefault();
        var consumers = $("#sendBroadcastForm input.consumer:checked").map(function(){
            return $(this).val();
        }).get();
        
        var interaction = {
            agentId: Meteor.userId(),
            businessNumber: Session.get('businessNumber'),
            message: $('#sendBroadcastForm #message').val(),
        };
        
        for(var x = 0; x < consumers.length; x++) {
            interaction.consumerNumber = consumers[x];
            Meteor.call('insertInteraction', interaction);
        }
        
        alert('Broadcast Sent.');
        $('#sendBroadcastForm #message').val('');
        $("#sendBroadcastForm input:checked").prop('checked', false);
    },
    'click .broadcast-cancel': function() {
        $('#groupForm #name').val('');
        $("#groupForm .consumers-list").select2('val', []);
        $('#sendBroadcastForm #message').val('');
        $("#sendBroadcastForm input:checked").prop('checked', false);
    },
});