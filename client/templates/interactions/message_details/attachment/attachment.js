Template.attachment.events({
    'click .attachment-btn': function(event) {
        $('.attachment-icons').fadeToggle();
    },
    'click .attach-image': function(event) {
        Session.set('attachType', 'Image');
    },
    'click .attach-video': function(event) {
        Session.set('attachType', 'Video');
    },
    'click .attach-audio': function(event) {
        Session.set('attachType', 'Audio');
    },
    'click .attach-other': function(event) {
        Session.set('attachType', 'Other');
    },
    'click .attach-map': function(event) {
        Session.set('attachType', 'Map');
    },
    'click .attach-contact': function(event) {
        Session.set('attachType', 'Contact');
    },
});