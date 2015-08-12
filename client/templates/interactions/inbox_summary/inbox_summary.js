Template.inboxSummary.rendered = function() {
    $('#claimed-div').on('scroll', function() {
        if($(this).scrollTop() + $(this).innerHeight() >= (this.scrollHeight - 5)) $('#loading-consumers').show();
        if($(this).scrollTop() + $(this).innerHeight() >= (this.scrollHeight - 1)) {
            Meteor.setTimeout(function() {
                Session.set('claimedLimit', Session.get('claimedLimit') + 3);
                $('#loading-consumers').hide();
                $('.has-tooltip').tooltip();
            }, 2000);
        }
    });
    $('.has-tooltip').tooltip();
};

Template.inboxSummary.helpers({
    consumers: function(type) {
        console.log(type);
        console.log('the type');
        console.log('here type');
        if(type == 'claimed') return getConsumers(Meteor.userId(), Session.get('claimedLimit'));
        else if(type == 'unclaimed') {
            var x = getConsumers('', false);
            console.log(x);
            console.log('aaaaf');
            return x;
        }
    },
    currentConsumer: function(number) {
        if(Session.get('currentConsumerInfo').number == number) return true;
        else return false;
    },
});

Template.inboxSummary.events({
    'click .view-consumer': function(event) {
        var number = event.currentTarget.dataset.number;
        var optedOut = event.currentTarget.dataset.optedout;
        var optedBy = event.currentTarget.dataset.optedby;
        var optedTimestamp = event.currentTarget.dataset.optedtimestamp;
        var type = event.currentTarget.dataset.type;
        var groupId = event.currentTarget.dataset.groupid;
        Session.set('currentConsumerInfo', {
            name: event.currentTarget.dataset.name,
            number: number,
            company: event.currentTarget.dataset.company,
            type: type
        });
        Session.set('groupId', groupId);
        Session.set('newMessage', false);
        
        $('#consumer-header').show();
        $('#consumersList').hide();
        if(optedOut == '1') {
            $('.attachment-icons button').attr('disabled', 'disabled');
            $('#text-form #message').attr('disabled', 'disabled');
            $('#text-form .send-message').attr('disabled', 'disabled');
        } else {
            $('.attachment-icons button').removeAttr('disabled');
            $('#text-form #message').removeAttr('disabled');
            $('#text-form .send-message').removeAttr('disabled');
        }
//        if($(event.currentTarget).hasClass('unclaimed')) Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'claimedBy', Meteor.userId());
        var condition = {
            businessNumber: Session.get('businessNumber')
        };
        if(Session.get('groupId')) condition.groupId = Session.get('groupId');
        else condition.consumerNumber = Session.get('currentConsumerInfo').number;
        Meteor.call('interactionSeen', condition, function() {
            setTimeout(function() {
                if(type == 'invite') {
                    $('#reply-form').hide();
                    $('#timeline').hide();
                } else {
                    $('#reply-form').show();
                    $('#timeline').show();
                }
                $('.timeline').scrollTop(0);
                var tooltip = ((optedOut == '1') ? 'Opt-out' : 'Unopt-out') + ': ' + Meteor.clientFn.timeFromNow(optedTimestamp) + '<br>By: ' + ((optedBy == 'consumer') ? 'Consumer' : Meteor.clientFn.userInfo('full_name', optedBy));
                $('button[data-numberid="' + number + '"]').tooltip({html: true, title: tooltip, placement: 'right'});
                if(optedBy == 'consumer' && optedOut == '1') $('button[data-numberid="' + number + '"]').prop('disabled', true);
                else $('button[data-numberid="' + number + '"]').prop('disabled', false);
            }, 100);
        });
    },
    'click .block': function(event) {
        if(confirm('Are you sure you want to block this consumer?')) {
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'blocked', '1');
            var interaction = {
                businessNumber: Session.get('businessNumber'),
                message: 'Consumer blocked by ' + Meteor.user().username,
                attachment: null,
                groupId: '',
                consumerNumber: Session.get('currentConsumerInfo').number,
            };

            Meteor.call('insertInteraction', interaction);
        }
    },
    'click .unblock': function(event) {
        if(confirm('Are you sure you want to unblock this consumer?')) {
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'blocked', '0');
            var interaction = {
                businessNumber: Session.get('businessNumber'),
                message: 'Consumer unblocked by ' + Meteor.user().username,
                attachment: null,
                groupId: '',
                consumerNumber: Session.get('currentConsumerInfo').number,
            };

            Meteor.call('insertInteraction', interaction);
        }
    },
    'click .optout': function(event) {
        if(confirm('Are you sure you want to opt-out this consumer?')) {
            setTimeout(function() {
                $('.attachment-icons button').attr('disabled', 'disabled');
                $('#text-form #message').attr('disabled', 'disabled');
                $('#text-form .send-message').attr('disabled', 'disabled');
                console.log($('#text-form #message').attr('disabled'));
                console.log($('#text-form .send-message').attr('disabled'));
            }, 100);
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'optedOut', '1');
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'optedBy', Meteor.userId());
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'optedTimestamp', ':timestamp');
            
            var interaction = {
                businessNumber: Session.get('businessNumber'),
                message: 'Consumer opted out by ' + Meteor.user().username,
                attachment: null,
                groupId: '',
                consumerNumber: Session.get('currentConsumerInfo').number,
            };

            Meteor.call('insertInteraction', interaction);
        }
    },
    'click .unoptout': function(event) {
        if(confirm('Are you sure you want to un-opt-out this consumer?')) {
            setTimeout(function() {
                $('.attachment-icons button').removeAttr('disabled');
                $('#text-form #message').removeAttr('disabled');
                $('#text-form .send-message').removeAttr('disabled');
                console.log($('#text-form #message').attr('disabled'));
                console.log($('#text-form .send-message').attr('disabled'));
            }, 100);
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'optedOut', '0');
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'optedBy', Meteor.userId());
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'optedTimestamp', ':timestamp');
            
            var interaction = {
                businessNumber: Session.get('businessNumber'),
                message: 'Consumer un-opted out by ' + Meteor.user().username,
                attachment: null,
                groupId: '',
                consumerNumber: Session.get('currentConsumerInfo').number,
            };

            Meteor.call('insertInteraction', interaction);
        }
    },
    'click .note-consumer': function(event) {
        Session.set('commonNotesType', 'consumer');
        $('#commonNotesModal .modal-title').text('Consumer Notes');
    },
    'click .accept-transfer': function(event) {
        if(confirm('Are you sure you want to accept this invite?')) {
            Meteor.call('transferClaim', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, Meteor.userId(), '');
            
            var interaction = {
                businessNumber: Session.get('businessNumber'),
                message: 'Transfer claim accepted by ' + Meteor.user().username,
                attachment: null,
                groupId: '',
                consumerNumber: Session.get('currentConsumerInfo').number,
            };

            Meteor.call('insertInteraction', interaction);
            
            setTimeout(function() {
                var currentConsumerInfo = Session.get('currentConsumerInfo');
                currentConsumerInfo.type = 'solo';
                Session.set('currentConsumerInfo', currentConsumerInfo);
                console.log($('#reply-form'));
                console.log($('#timeline'));
                console.log('qwerty');
                $('#reply-form').show();
                $('#timeline').show();
            }, 500);
        }
    },
    'click .reject-transfer': function(event) {
        if(confirm('Are you sure you want to reject this invite?')) {
            Meteor.call('transferClaim', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, false, '');
            
            var interaction = {
                businessNumber: Session.get('businessNumber'),
                message: 'Transfer claim rejected by ' + Meteor.user().username,
                attachment: null,
                groupId: '',
                consumerNumber: Session.get('currentConsumerInfo').number,
            };

            Meteor.call('insertInteraction', interaction);
        }
    },
    'click .group-conversation': function(event) {
        if(Session.get('groupId')) {
            var group = GroupConversations.findOne(Session.get('groupId'));
            $("#groupConversationForm .agents-list").select2('val', group.agents);
            $("#groupConversationForm .consumers-list").select2('val', group.consumers);
        } else {
            $("#groupConversationForm .agents-list").select2('val', '');
            $("#groupConversationForm .consumers-list").select2('val', '');
        }
    },
    'click .activate-group': function(event) {
        if(confirm('Are you sure you want to activate this group?')) {
            var groupId = event.target.dataset.groupid;
            Meteor.call('updateGroupConversation', groupId, {active: '1'});
            
            var interaction = {
                businessNumber: Session.get('businessNumber'),
                message: 'Group activated',
                attachment: null,
                groupId: groupId,
                consumerNumber: Session.get('currentConsumerInfo').number,
            };

            Meteor.call('insertInteraction', interaction);
        }
    },
    'click .deactivate-group': function(event) {
        if(confirm('Are you sure you want to deactivate this group?')) {
            var groupId = event.target.dataset.groupid;
            Meteor.call('updateGroupConversation', groupId, {active: '0'});
            
            var interaction = {
                businessNumber: Session.get('businessNumber'),
                message: 'Group deactivated',
                attachment: null,
                groupId: groupId,
                consumerNumber: Session.get('currentConsumerInfo').number,
            };

            Meteor.call('insertInteraction', interaction);
        }
    },
    'click .claim-consumer': function(event) {
        if(confirm('You are about to claim this consumer. Proceed?')) {
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'claimedBy', Meteor.userId());
        }
    },
    'click .unclaim-consumer': function(event) {
        if(confirm('Are you sure you want to unclaim this consumer?')) {
            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'claimedBy', '');
            Session.set('currentConsumerInfo', null);
            $('#timeline').hide();
            $('#consumer-header').hide();
//            $('#consumersList').show();
        }
    },
});

function getConsumers(claimedBy, limit) {
    var businessNumber = Session.get('businessNumber');
    var inboxSearchKeyword = Session.get('inboxSearchKeyword').toLowerCase();
    var inboxSearchType = Session.get('inboxSearchType');
    var interactions = Interactions.find({'businessNumber': businessNumber, blocked: {$ne: '1'}}, {sort: {'timestamp': -1}}).fetch();
    var consumers = [];
    var consumerNumbers = [];
    var groupIds = [];
    var userId = Meteor.userId();
    var user = Meteor.user();
    if(claimedBy != '' && inboxSearchKeyword == '') {
        var transferInvites = Consumers.find({'identity.transferInvite': userId}).fetch();
        for(var x = 0; x < transferInvites.length; x++) {
            var consumer = transferInvites[x];
            var consumerIdentity = false;
            for(var y = 0; y < consumer.identity.length; y++) {
                var identity = consumer.identity[y];
                if(identity.businessId == user.profile.businessId) consumerIdentity = identity;
            }
            if(consumerIdentity) {
                consumers.push({
                    name: consumerIdentity.first + ' ' + consumerIdentity.last,
                    company: consumerIdentity.company,
                    number: consumer.mobile_number,
                    lastMsg: 'Transfer Invite from ' + Meteor.clientFn.userInfo('username', consumerIdentity.claimedBy),
                    lastTimestamp: consumerIdentity.transferInviteTimestamp,
                    type: 'invite'
                });
            }
        }
    }
    
    for(var x = 0; x < interactions.length; x++) {
        var interaction = interactions[x];
        if(claimedBy != '' && interaction.groupId) {
            var group = GroupConversations.findOne(interaction.groupId);
            if(group && $.inArray(userId, group.agents) > -1 && $.inArray(group._id, groupIds) === -1) {
                if(limit === false || (limit && consumers.length < limit)) {
                    var groupName = getGroupName(group.agents, group.consumers);
                    var groupNumbers = group.consumers.join(', ');
                    if(inboxSearchKeyword == '' || 
                       (inboxSearchType == 'mobile' && inboxSearchKeyword != '' && groupNumbers.indexOf(inboxSearchKeyword) > -1) ||
                       (inboxSearchType == 'consumer' && inboxSearchKeyword != '' && (groupName.toLowerCase()).indexOf(inboxSearchKeyword) > -1) ||
                       (inboxSearchType == 'consumer' && inboxSearchKeyword != '' && Interactions.find({businessNumber: businessNumber, groupId: group._id, message: {$regex: inboxSearchKeyword}}).count() > 0)
                    ) {
                        var lastMsg = interaction.message;
                        if(lastMsg.length > 20) lastMsg = interaction.message.substring(0, 20) + '...';
                        groupIds.push(group._id);
                        consumers.push({
                            name: groupName,
                            sName: getGroupName([group.agents[0]], []) + ' and others...',
                            number: groupNumbers,
                            sNumber: group.consumers[0] + '...',
                            lastMsg: lastMsg,
                            lastTimestamp: interaction.timestamp,
                            unreadCount: Interactions.find({'businessNumber': businessNumber, 'groupId': group._id, 'seen': '0', fromAgent: '0'}).count(),
                            type: 'group',
                            groupId: group._id,
                            active: group.active
                        });
                    }
                }
            }
        } else {
            var consumer = Consumers.findOne({mobile_number: interaction.consumerNumber});
            var consumerIdentity = false;
            if(consumer) {
                for(var y = 0; y < consumer.identity.length; y++) {
                    var identity = consumer.identity[y];
                    if(identity.businessId == user.profile.businessId && 
                       ((claimedBy != '' && identity.claimedBy == claimedBy) || 
                        (claimedBy == '' && user.profile.supervisor == '1' && identity.claimedBy != userId) ||
                        (claimedBy == '' && identity.claimedBy == '')
                       )
                      ) {
                        consumerIdentity = identity;
                    }
                }
            }
            if(consumerIdentity && $.inArray(interaction.consumerNumber, consumerNumbers) === -1) {
                if(consumerIdentity.isEmployee != '1' && (limit === false || (limit && consumers.length < limit))) {
                    var consumerFullName = consumerIdentity.first + ' ' + consumerIdentity.last;
                    var consumerMobile = consumer.mobile_number;
                    if(inboxSearchKeyword == '' || 
                       (inboxSearchType == 'mobile' && inboxSearchKeyword != '' && consumerMobile.indexOf(inboxSearchKeyword) > -1) ||
                       (inboxSearchType == 'consumer' && inboxSearchKeyword != '' && (consumerFullName.toLowerCase()).indexOf(inboxSearchKeyword) > -1) ||
                       (inboxSearchType == 'consumer' && inboxSearchKeyword != '' && (consumerIdentity.company.toLowerCase()).indexOf(inboxSearchKeyword) > -1) ||
                       (inboxSearchType == 'consumer' && inboxSearchKeyword != '' && Interactions.find({businessNumber: businessNumber, consumerNumber: consumerMobile, message: {$regex: inboxSearchKeyword}}).count() > 0)
                    ) {
                        var lastMsg = interaction.message;
                        if(lastMsg.length > 20) lastMsg = interaction.message.substring(0, 20) + '...';
                        consumerNumbers.push(interaction.consumerNumber);
                        consumers.push({
                            name: consumerFullName,
                            company: consumerIdentity.company,
                            number: consumerMobile,
                            blocked: consumerIdentity.blocked,
                            optedOut: consumerIdentity.optedOut,
                            optedBy: consumerIdentity.optedBy,
                            optedTimestamp: consumerIdentity.optedTimestamp,
                            optedMsg: 'Opt-' + ((consumerIdentity.optedOut == '1') ? 'in' : 'out') + ': ' + Meteor.clientFn.timeFromNow(consumerIdentity.optedTimestamp) + '<br>By: ',
                            lastMsg: lastMsg,
                            lastTimestamp: interaction.timestamp,
                            unreadCount: Interactions.find({'businessNumber': businessNumber, 'consumerNumber': consumerMobile, 'seen': '0', fromAgent: '0'}).count(),
                            type: 'solo',
                            claimed: (consumerIdentity.claimedBy != '') ? '1' : '0'
                        });
                    }
                }
            }
        }
        if(limit && consumers.length == limit) break;
    }
    return consumers;
}

function getGroupName(agents, consumers) {
    var name = [];
    
    for(var x = 0; x < agents.length; x++) {
        name.push(Meteor.clientFn.userInfo('username', agents[x]));
    }
    
    for(var x = 0; x < consumers.length; x++) {
        var consumer = Consumers.findOne({mobile_number: consumers[x]});
        for(var y = 0; y < consumer.identity.length; y++) {
            var identity = consumer.identity[y];
            if(identity.businessId == Meteor.user().profile.businessId) name.push(identity.first + ' ' + identity.last);
        }
    }
    
    return name.join(', ');
}