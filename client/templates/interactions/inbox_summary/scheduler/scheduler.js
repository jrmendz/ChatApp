Template.eventScheduler.rendered = function() {
    $('#eventSchedulerForm .datepicker').pickadate({
        format: 'mmm d, yyyy',
        formatSubmit: 'yyyy-mm-dd',
    });
    
    $('#eventSchedulerForm .timepicker').pickatime({
        formatSubmit: 'HH:i'
    });
    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        },
        selectable: true,
        selectHelper: true,
        select: function(start, end) {
            Session.set('eventMode', 'Add');
            $('.start.datepicker').pickadate('picker').set('select', start.format('MMM D, YYYY'), {format: 'mmm d, yyyy'});
            $('.start.timepicker').pickatime('picker').set('select', start.format('hh:mm A'), {format: 'h:i A'});
            $('.end.datepicker').pickadate('picker').set('select', end.format('MMM D, YYYY'), {format: 'mmm d, yyyy'});
            $('.end.timepicker').pickatime('picker').set('select', end.format('hh:mm A'), {format: 'h:i A'});
            $('#urgent').prop('checked', false);
            $('.title').val('');
            $('.description').val('');
            $('#eventFormModal').modal();
        },
        eventClick:  function(event, jsEvent, view) {
            Session.set('eventMode', 'Edit');
            Session.set('currentEventId', event._id);
            $('.start.datepicker').pickadate('picker').set('select', event.start.format('MMM D, YYYY'), {format: 'mmm d, yyyy'});
            $('.start.timepicker').pickatime('picker').set('select', event.start.format('hh:mm A'), {format: 'h:i A'});
            if(event.end) {
                $('.end.datepicker').pickadate('picker').set('select', event.end.format('MMM D, YYYY'), {format: 'mmm d, yyyy'});
                $('.end.timepicker').pickatime('picker').set('select', event.end.format('hh:mm A'), {format: 'h:i A'});
            } else {
                $('.end.datepicker').pickadate('picker').set('select', event.start.format('MMM D, YYYY'), {format: 'mmm d, yyyy'});
                $('.end.timepicker').pickatime('picker').set('select', event.start.format('hh:mm A'), {format: 'h:i A'});
            }

            if(event.urgent == '1') $('#urgent').prop('checked', true);
            else $('#urgent').prop('checked', false);
            $('.title').val(event.title);
            $('.description').val(event.description);
            $('#eventFormModal').modal();
        },
        editable: true,
        eventLimit: true,
        events: []
    });
    
    $('#eventSchedulerModal').on('shown.bs.modal', function () {
        $("#calendar").fullCalendar('render');
    });
    this.autorun(function() {
        var calendarEvents = CalendarEvents.find({businessId: Meteor.user().profile.businessId}).fetch();
        $('#calendar').fullCalendar('removeEvents');
        if(calendarEvents) {
            var consumers = [];
            var colors = [];
            for(var x = 0; x < calendarEvents[0].events.length; x++) {
                var event = calendarEvents[0].events[x];
                var consumerIndex = $.inArray(event.consumerNumber, consumers);
                if(consumerIndex > -1) calendarEvents[0].events[x].color = colors[consumerIndex];
                else {
                    var color = getRandomColor();
                    colors.push(color);
                    consumers.push(event.consumerNumber);
                    calendarEvents[0].events[x].color = color;
                }
            }
            console.log(calendarEvents[0].events);
            $('#calendar').fullCalendar('addEventSource', calendarEvents[0].events);
        }
    });
};

Template.eventScheduler.helpers({
    mode: function () {
        return Session.get('eventMode');
    },
    editMode: function () {
        if(Session.get('eventMode') == 'Edit') return true;
        else return false;
    }
});

Template.eventScheduler.events({
    'click .remove-event': function() {
        if(confirm('Are you sure you want to delete this event?')) {
            $('#calendar').fullCalendar('removeEvents', Session.get('currentEventId'));
            $('#eventFormModal').modal('hide');
            Meteor.call('removeCalendarEvent', Meteor.user().profile.businessId, Session.get('currentEventId'));
        }
    },
    'submit #eventSchedulerForm': function (event) {
        event.preventDefault();
        var mode = Session.get('eventMode');
        var values = event.target;
        var start = values.startDate_submit.value + ' ' + values.startTime_submit.value + ':00';
        var end = values.endDate_submit.value + ' ' + values.endTime_submit.value + ':00';
        var event;
        if(mode == 'Add') {
            var _id = '_fc_' + moment().format('YYYY_MM_DD__HH_mm_ss');
            event = {
                _id: _id,
                allDay: false,
                start: moment(start),
                end: moment(end),
                title: values.title.value,
                urgent: ($('#urgent').is(':checked')) ? '1' : '0',
                description: values.description.value
            };
            $('#calendar').fullCalendar('renderEvent', event, true);
            $('#calendar').fullCalendar('unselect');
            
            Meteor.call('addCalendarEvent', Meteor.user().profile.businessId, {
                _id: _id,
                allDay: false,
                start: start,
                end: end,
                title: values.title.value,
                urgent: ($('#urgent').is(':checked')) ? '1' : '0',
                description: values.description.value,
                agentId: Meteor.userId(),
                consumerNumber: Session.get('currentConsumerInfo').number,
                businessNumber: Session.get('businessNumber')
            });
        } else if(mode == 'Edit') {
            event = $('#calendar').fullCalendar('clientEvents', Session.get('currentEventId'))[0];
            event.start = moment(start);
            event.end = moment(end);
            event.title = values.title.value;
            event.urgent = ($('#urgent').is(':checked')) ? '1' : '0';
            event.description = values.description.value;
            $('#calendar').fullCalendar('updateEvent', event);
            $('#calendar').fullCalendar('unselect');
            
            Meteor.call('updateCalendarEvent', Meteor.user().profile.businessId, Session.get('currentEventId'), {
                _id: Session.get('currentEventId'),
                allDay: false,
                start: start,
                end: end,
                title: values.title.value,
                urgent: ($('#urgent').is(':checked')) ? '1' : '0',
                description: values.description.value,
                agentId: Meteor.userId(),
                consumerNumber: Session.get('currentConsumerInfo').number,
                businessNumber: Session.get('businessNumber')
            });
        }
        $('#eventFormModal').modal('hide');
    }
});

function getRandomColor() {
    var letters = '012345'.split('');
    var color = '#';        
    color += letters[Math.round(Math.random() * 5)];
    letters = '0123456789ABCDEF'.split('');
    for (var i = 0; i < 5; i++) {
        color += letters[Math.round(Math.random() * 15)];
    }
    return color;
}