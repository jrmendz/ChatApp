Template.commonNotes.created = function() {
    Session.set('commonNotesMode', 'Add');
};

Template.commonNotes.helpers({
    commonNotesMode: function () {
        return Session.get('commonNotesMode');
    },
    notesList: function () {
        var notes = Notes.findOne({businessId: Meteor.user().profile.businessId, consumerNumber: Session.get('currentConsumerInfo').number});
        var notesList = [];
        if(notes) {
            if(Session.get('commonNotesType') == 'consumer') notes = notes.consumerNotes;
            else notes = notes.messageNotes;
            console.log(notes);
            for(var x = 0; x < notes.length; x++) {
                var note = notes[x];
                if(Meteor.user().profile.supervisor == '1' || 
                   (note.deleted != '1' && Meteor.user().profile.supervisor != '1' && note.createdBy == Meteor.userId())) 
                    if((Session.get('commonNotesType') == 'message' && Session.get('currentInteractionId') == note.interactionId) || 
                       Session.get('commonNotesType') == 'consumer') notesList.push(note);
            }
        }
        return notesList;
    }
});

Template.commonNotes.events({
    'click .add-note': function() {
        $('.create-info').hide();
        $('.delete-info').hide();
        $('.action-buttons').show();
        $('#note').val('');
        Session.set('commonNotesMode', 'Add');
    },
    'click .view-note': function(event) {
        Session.set('commonNotesMode', 'View');
//        var notes = Notes.findOne({businessId: Meteor.user().profile.businessId, consumerNumber: Session.get('currentConsumerInfo').number});
//        if(Session.get('commonNotesType') == 'consumer') notes = notes.consumerNotes;
//        else notes = notes.messageNotes;
        
//        var note = notes[event.target.dataset.idx];
        $('.create-info').show();
        $('#created').html('by <strong>' + Meteor.clientFn.userInfo('full_name', event.target.dataset.createdby) + '</strong> @ <strong>' + event.target.dataset.createdat + '</strong>');
        if(event.target.dataset.deleted == '1' && Meteor.user().profile.supervisor == '1') {
            $('.delete-info').show();
            $('#deleted').html('by <strong>' + Meteor.clientFn.userInfo('full_name', event.target.dataset.deletedby) + '</strong> @ <strong>' + event.target.dataset.deletedat + '</strong>');
        } else $('.delete-info').hide();
        $('#note').val(event.target.dataset.note);
    },
    'click .remove-note': function(event) {
        if(confirm('Are you sure you want to delete this note?')) {
            var indexOrIdTimestamp = event.target.dataset.idx;
            if(Session.get('commonNotesType') == 'message') indexOrIdTimestamp = event.target.dataset.idtimestamp;
            Meteor.call('removeCommonNote', Meteor.user().profile.businessId, Meteor.userId(), Session.get('currentConsumerInfo').number, indexOrIdTimestamp, Session.get('commonNotesType'));
            $('.create-info').hide();
            $('.delete-info').hide();
            $('.action-buttons').show();
            $('#note').val('');
            Session.set('commonNotesMode', 'Add');
        }
    },
    'submit #commonNotesForm': function (event) {
        event.preventDefault();
        var newNote = { note: event.target.note.value };
        
        if(Session.get('commonNotesType') == 'message') newNote.interactionId = Session.get('currentInteractionId');
        console.log(newNote);
        Meteor.call('addCommonNote', Meteor.user().profile.businessId, Meteor.userId(), Session.get('currentConsumerInfo').number, newNote, Session.get('commonNotesType'));
        $('.create-info').hide();
        $('.delete-info').hide();
        $('.action-buttons').show();
        $('#note').val('');
        Session.set('commonNotesMode', 'Add');
    },
    'click .notes-cancel': function() {
        $('.create-info').hide();
        $('.delete-info').hide();
        $('.action-buttons').show();
        $('#note').val('');
        Session.set('commonNotesMode', 'Add');
    }
});