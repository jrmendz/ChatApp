Template.forwardMessage.created = function() {
    Session.set('agentMessage', '');
};

Template.forwardMessage.rendered = function() {
    $("#forwardMessageForm .employees-list").select2();
};

Template.forwardMessage.helpers({
    forwardedHistory: function() {
        return ForwardedConversations.find({interactionId: Session.get('currentInteractionId')}, {sort: {createdAt: -1}});
    },
    employees: function() {
        console.log('employees');
        var employees = [];
        var businessContacts = Consumers.find({'identity.businessId': Meteor.user().profile.businessId}).fetch();
        for(var x = 0; x < businessContacts.length; x++) {
            for(var y = 0; y < businessContacts[x].identity.length; y++) {
                var identity = businessContacts[x].identity[y];
                console.log(identity);
                console.log('identity');
                if(identity.isEmployee == '1') {
                    employees.push({
                        _id: businessContacts[x]._id,
                        name: identity.first + ' ' + identity.last,
                        number: businessContacts[x].mobile_number,
                        email: identity.email
                    });
                }
            }
        }
        return employees;
    },
    messageToForward: messageToForward,
});

Template.forwardMessage.events({
    'keyup #forwardMessageForm #yourMessage': function(event) {
        Session.set('agentMessage', event.target.value);
    },
    'click #forwardMessageForm .send-mobile': function(event) {
        var number = $('.employees-list option:selected').attr('data-number');
        if(number) {
            sendMessage('number', true, number);
        } else alert('No mobile number found.');
    },
    'click #forwardMessageForm .send-email': function(event) {
        var email = $('.employees-list option:selected').attr('data-email');
        if(email) {
            sendMessage('email', true, false, email);
        } else alert('No email found.');
    },
    'click #forwardMessageForm .send-both': function(event) {
        var number = $('.employees-list option:selected').attr('data-number');
        var email = $('.employees-list option:selected').attr('data-email');
        if(number && email) {
            sendMessage('both', true, number, email);
        } else alert('Either mobile number or email address was not found.');
    },
    'click #forwardMessageForm .send': function(event) {
        var recipient = $('#forwardMessageForm #manualRecipient').val();
        var number = recipient.replace(/\D/g,'');
        if(number.length == 10) sendMessage('number', false, number);
        else if(recipient.indexOf('@') > -1) sendMessage('email', false, false, recipient);
        else alert('Invalid recipient.')
    },
});

function messageToForward() {
    var message = Session.get('currentInteractionMessage');
    var name = Session.get('currentInteractionName');
    var timestamp = Session.get('currentInteractionTimestamp');
    var agentMessage = Session.get('agentMessage');
    return '"' + message + ' [' + name + ' - ' + timestamp + ']" - *' + agentMessage + '*';
}

function sendMessage(type, isEmployee, number, email) {
    var forward = {
        businessNumber: Session.get('businessNumber'),
        createdBy: Meteor.userId(), 
        interactionId: Session.get('currentInteractionId'), 
        message: messageToForward(),
        type: type
    };
    if(isEmployee) forward.employeeId = $('.employees-list').val();
    if(type == 'both' || type == 'number') forward.number = number;
    if(type == 'both' || type == 'email') forward.email = email;
    Meteor.call('forwardMessage', forward);
    alert('Message forwarded.');
    reset();
}

function reset() {
    Session.set('agentMessage', '');
    $("#forwardMessageForm .employees-list").select2('val', '');
    $('#forwardMessageForm #manualRecipient').val('');
    $('#forwardMessageForm #yourMessage').val('');
}