Template.calendar.rendered = function() {
    this.autorun(function () {
        var agent = CalendarEvents.findOne({agentId: Meteor.userId()});
        var events = [];
        if(agent) events = agent.events;
        
        $('#calendar').fullCalendar('destroy');
        
        $('#calendar').fullCalendar({
            header: {
                left: 'prev,next today',
                center: 'title',
                right: 'month,agendaWeek,agendaDay'
            },
            editable: true,
            droppable: true,
            drop: function(date, allDay) {
                var originalEventObject = $(this).data('eventObject');
                var copiedEventObject = $.extend({}, originalEventObject);
                copiedEventObject.start = date;
                copiedEventObject.allDay = allDay;

                $('#calendar').fullCalendar('renderEvent', copiedEventObject, true);

                if ($('#drop-remove').is(':checked')) {
                    $(this).remove();
                }

            },
            events: events
        });

        $('#external-events .fc-event').each(function() {
            var eventObject = {
                title: $.trim($(this).text())
            };

            $(this).data('eventObject', eventObject);

            $(this).draggable({
                zIndex: 999,
                revert: true,
                revertDuration: 0
            });

        });
        
    });
};

Template.calendar.events({
    'click #save-events': function() {
        var events = $('#calendar').fullCalendar('clientEvents');
        var agentEvents = [];
        for(var x = 0; x < events.length; x++) {
            var event = events[x];
            var values = {
//                _id: event._id,
                start: event.start.format('YYYY-MM-DD HH:mm:ss'),
                end: (event.end) ? event.end.format('YYYY-MM-DD HH:mm:ss') : null,
                title: event.title,
                allDay: (event.allDay) ? true : false,
            }; 
            agentEvents.push(values);
        }
        Meteor.call('calendarEvents', Meteor.userId(), agentEvents);
        alert('Events Saved.');
    }
});