Template.autorespond.rendered = function() {
    $('#autorespondForm .timepicker').pickatime({
        formatSubmit: 'HH:i'
    });
};

Template.autorespond.helpers({
    message: function() {
        var autorespond = Settings.findOne({businessId: Meteor.user().profile.businessId}).settings.autorespond;
        if(autorespond) return autorespond.message;
        else return '';
    },
    days: function() {
        var autorespond = Settings.findOne({businessId: Meteor.user().profile.businessId}).settings.autorespond;
        if(autorespond) return autorespond.days;
        else return [
            { 'day' : 'monday', 'open' : '1', 'openHours' : '', 'closeHours' : '' }, 
            { 'day' : 'tuesday', 'open' : '1', 'openHours' : '', 'closeHours' : '' }, 
            { 'day' : 'wednesday', 'open' : '1', 'openHours' : '', 'closeHours' : '' }, 
            { 'day' : 'thursday', 'open' : '1', 'openHours' : '', 'closeHours' : '' }, 
            { 'day' : 'friday', 'open' : '1', 'openHours' : '', 'closeHours' : '' }, 
            { 'day' : 'saturday', 'open' : '0', 'openHours' : '', 'closeHours' : '' }, 
            { 'day' : 'sunday', 'open' : '0', 'openHours' : '', 'closeHours' : '' }
        ];
    },
    checked: function(value) {
        if(value == '0') return 'checked';
    },
});

Template.autorespond.events({
    'click .clear-time': function(event) {
        var day = event.currentTarget.dataset.day;
        var type = event.currentTarget.dataset.type;
        $('#' + day + '-' + type + '-hours').pickatime('picker').clear();
    },
    'change .check-box': function(event) {
        var day = event.currentTarget.dataset.day;
        if($(event.target).is(':checked')) {
            $('#' + day + '-open-hours').pickatime('picker').clear();
            $('#' + day + '-close-hours').pickatime('picker').clear();
        }
    },
    'submit #autorespondForm': function(event) {
        event.preventDefault();
        var autorespond = {
            message: $('#autorespondForm #message').val()
        };
        var mondayOpen = checked($('#autorespondForm #monday-open-day:checked').val());
        var tuesdayOpen = checked($('#autorespondForm #tuesday-open-day:checked').val());
        var wednesdayOpen = checked($('#autorespondForm #wednesday-open-day:checked').val());
        var thursdayOpen = checked($('#autorespondForm #thursday-open-day:checked').val());
        var fridayOpen = checked($('#autorespondForm #friday-open-day:checked').val());
        var saturdayOpen = checked($('#autorespondForm #saturday-open-day:checked').val());
        var sundayOpen = checked($('#autorespondForm #sunday-open-day:checked').val());
        
        autorespond.days = [];
        autorespond.days.push({
            day: 'monday',
            open: mondayOpen,
            openHours: (mondayOpen == '1') ? $('#autorespondForm input[name="mondayOpenHours_submit"]').val() : '',
            closeHours: (mondayOpen == '1') ? $('#autorespondForm input[name="mondayCloseHours_submit"]').val() : ''
        });
        autorespond.days.push({
            day: 'tuesday',
            open: tuesdayOpen,
            openHours: (tuesdayOpen == '1') ? $('#autorespondForm input[name="tuesdayOpenHours_submit"]').val() : '',
            closeHours: (tuesdayOpen == '1') ? $('#autorespondForm input[name="tuesdayCloseHours_submit"]').val() : ''
        });
        autorespond.days.push({
            day: 'wednesday',
            open: wednesdayOpen,
            openHours: (wednesdayOpen == '1') ? $('#autorespondForm input[name="wednesdayOpenHours_submit"]').val() : '',
            closeHours: (wednesdayOpen == '1') ? $('#autorespondForm input[name="wednesdayCloseHours_submit"]').val() : ''
        });
        autorespond.days.push({
            day: 'thursday',
            open: thursdayOpen,
            openHours: (thursdayOpen == '1') ? $('#autorespondForm input[name="thursdayOpenHours_submit"]').val() : '',
            closeHours: (thursdayOpen == '1') ? $('#autorespondForm input[name="thursdayCloseHours_submit"]').val() : ''
        });
        autorespond.days.push({
            day: 'friday',
            open: fridayOpen,
            openHours: (fridayOpen == '1') ? $('#autorespondForm input[name="fridayOpenHours_submit"]').val() : '',
            closeHours: (fridayOpen == '1') ? $('#autorespondForm input[name="fridayCloseHours_submit"]').val() : ''
        });
        autorespond.days.push({
            day: 'saturday',
            open: saturdayOpen,
            openHours: (saturdayOpen == '1') ? $('#autorespondForm input[name="saturdayOpenHours_submit"]').val() : '',
            closeHours: (saturdayOpen == '1') ? $('#autorespondForm input[name="saturdayCloseHours_submit"]').val() : ''
        });
        autorespond.days.push({
            day: 'sunday',
            open: sundayOpen,
            openHours: (sundayOpen == '1') ? $('#autorespondForm input[name="sundayOpenHours_submit"]').val() : '',
            closeHours: (sundayOpen == '1') ? $('#autorespondForm input[name="sundayCloseHours_submit"]').val() : ''
        });
        Meteor.call('autorespond', Meteor.user().profile.businessId, autorespond);
        alert('Settings Saved.');
    },
});

function checked(value) {
    if(typeof value === 'undefined') return '1';
    else return '0';
}