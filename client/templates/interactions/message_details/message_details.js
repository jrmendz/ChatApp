Template.messageDetails.rendered = function() {
    $('#reply-form').hide();
    $('#timeline').hide();
};

Template.messageDetails.helpers({
    consumers: function() {
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
    agents: function() {
        return Meteor.users.find({'profile.businessId': Meteor.user().profile.businessId, _id: {$ne: Meteor.userId()}});
    },
    currentConsumerInfo: function() {
        return Session.get('currentConsumerInfo');
    },
    interactions: function() {
        if(Session.get('groupId')) return Interactions.find({'businessNumber': Session.get('businessNumber'), 'groupId': Session.get('groupId'), blocked: {$ne: '1'}}, {sort: {timestamp: -1}});
        else return Interactions.find({'businessNumber': Session.get('businessNumber'), 'consumerNumber': Session.get('currentConsumerInfo').number, 'groupId': '', blocked: {$ne: '1'}}, {sort: {timestamp: -1}});
    },
    messageClass: function(fromAgent) {
        console.log('done');
        ////if(fromAgent == '1') return '';
        //else return '-inverted';
		if(fromAgent == '1') return 'self';
		else return '';
    },
    messageType: function(fromAgent) {
        if(fromAgent == '1') return 'outgoing';
        else return 'incoming';
    },
    userNumber: function(fromAgent, consumerNumber, isAutomated) {
        if(fromAgent == '1') {
            if(isAutomated == '1') return 'System';
            else return 'You';
        } else {
            if(Session.get('groupId')) {
                var consumer = Consumers.findOne({mobile_number: consumerNumber});
                for(var y = 0; y < consumer.identity.length; y++) {
                    var identity = consumer.identity[y];
                    if(identity.businessId == Meteor.user().profile.businessId) return identity.first + ' ' + identity.last;
                }
                return '';
            } else return Session.get('currentConsumerInfo').name;
        }
    },
    hasAttachment: function(attachment) {
        if(attachment) return true;
        else return false;
    },
    sessionAttachment: function() {
        return Session.get('attachment');
    },
    attachmentDisabled: function() {
        if(Session.get('attachment')) return 'disabled';
        else return '';
    },
    optedOut: function() {
        if(Session.get('currentConsumerInfo').optedOut == '1') return 'disabled';
        else return '';
    },
    fileType: function(fileName) {
        var extension = fileName.substring(fileName.lastIndexOf('.') + 1);
        var imageExtensions = ['jpg', 'gif', 'png', 'jpeg'];
        var videoExtensions = ['mp4', 'ogg', 'webm'];
        var audioExtensions = ['mp3', 'wav'];
        if($.inArray(extension, imageExtensions) > -1) return 'img';
        else if($.inArray(extension, videoExtensions) > -1) return 'video/' + extension;
        else if($.inArray(extension, audioExtensions) > -1) return (extension == 'mp3') ? 'audio/mpeg' : 'audo/wav';
    }
});

Template.messageDetails.events({
    'click .send-message': function() {
        var number = $("#number").val();
        var attachment = null;
        if(Session.get('attachment')) attachment = {fileName: Session.get('attachment'), fileLocation: '/files'};
        var interaction = {
            businessNumber: Session.get('businessNumber'),
            message: $('#message').val(),
            attachment: attachment,
            groupId: '',
            consumerNumber: '',
        };
        if(Session.get('groupId')) interaction.groupId = Session.get('groupId');
        else interaction.consumerNumber = Session.get('currentConsumerInfo').number;

        Meteor.call('insertInteraction', interaction, function() {
            $('#text-form')[0].reset();
            $('#attachment').val('');
            $('.message-sent').fadeIn();
            Session.set('attachment', undefined);
            Dropzone.forElement("#dropzoneDiv").removeAllFiles();
            setTimeout(function() {
                $('.message-sent').fadeOut();
            }, 5000);
        });
    },
//    'click .unclaim-consumer': function(event) {
//        if(confirm('Are you sure you want to unclaim this consumer?')) {
//            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'claimedBy', '');
//            Session.set('currentConsumerInfo', null);
//            Session.set('newMessage', true);
//            $('#timeline').hide();
//            $('#consumer-header').hide();
//            $('#consumersList').show();
//        }
//    },
//    'click .transfer-claim': function(event) {
//        if(confirm('Are you sure you want to transfer this claim?')) {
//            Meteor.call('updateConsumerIdentity', Meteor.user().profile.businessId, Session.get('currentConsumerInfo').number, 'claimedBy', $('.agents-list').val());
//            Session.set('currentConsumerInfo', null);
//            Session.set('newMessage', true);
//            $('#timeline').hide();
//            $('#consumer-header').hide();
//            $('#consumersList').show();
//        }
//    },
    'click .remove-attachment': function(event) {
        Session.set('attachment', undefined);
        Dropzone.forElement("#dropzoneDiv").removeAllFiles();
    },
    'click .preview-attachment': function(event) {
        var file = event.currentTarget.dataset.file;
        var type = event.currentTarget.dataset.type;
        if(type == 'img') {
            $('#preview video').hide();
            $('#preview audio').hide();
            $('#preview img').attr('src', '/files/' + file);
            $('#preview img').show();
        } else if(type == 'video/mp4' || type == 'video/ogg' || type == 'video/webm') {
            $('#preview img').hide();
            $('#preview audio').hide();
            $('#preview video').attr('src', '/files/' + file);
            $('#preview video').attr('type', type);
            $('#preview video').show();
        } else if(type == 'audio/mpeg' || type == 'audio/wav') {
            $('#preview img').hide();
            $('#preview video').hide();
            $('#preview audio').attr('src', '/files/' + file);
            $('#preview audio').attr('type', type);
            $('#preview audio').show();
        }

        $('#preview #title').text(file);
        $('#preview').modal('show');
    },
    'click .note-message': function(event) {
        Session.set('commonNotesType', 'message');
        Session.set('currentInteractionId', event.target.dataset.id);
        $('#commonNotesModal .modal-title').text('Message Notes');
        
        $('.create-info').hide();
        $('.delete-info').hide();
        $('.action-buttons').show();
        $('#note').val('');
        Session.set('commonNotesMode', 'Add');
    },
    'click .forward-message': function(event) {
        Session.set('currentInteractionId', event.target.dataset.id);
        Session.set('currentInteractionMessage', event.target.dataset.message);
        Session.set('currentInteractionName', event.target.dataset.name);
        Session.set('currentInteractionTimestamp', event.target.dataset.timestamp);
    },
});