Template.eventscheduler.helpers({
    eventscheduler: function() {
        var eventscheduler = Settings.findOne({businessId: Meteor.user().profile.businessId}).settings.eventscheduler;
        if(eventscheduler) return eventscheduler;
        else return {};
    },
    hours: function() {
        return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
               '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
    },
    hourLabel: function(hour) {
        if(hour == '1') return 'hour';
        else return 'hours';
    },
    checked: function(includeTimestamp) {
        if(includeTimestamp == '1') return 'checked';
        else return '';
    },
    selected: function(hour, hoursAdvance) {
        if(hour == hoursAdvance) return 'selected';
        else return '';
    },
});

Template.eventscheduler.events({
    'submit #eventschedulerForm': function(event) {
        event.preventDefault();
        var eventscheduler = {
            message: event.target.message.value,
            includeTimestamp: ($('#eventschedulerForm .include-timestamp:checked').val()) ? '1' : '0',
            hoursAdvance: event.target.hoursAdvance.value
        };
        console.log(eventscheduler);
        Meteor.call('eventscheduler', Meteor.user().profile.businessId, eventscheduler);
        alert('Settings Saved.');
    },
});