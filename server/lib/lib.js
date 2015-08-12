//{"To": "+11234567890", "From": "+11234512345", "Body": "#abc", "NumMedia": "0", "MessageSid": "!@#123"}
//{"businessNumber": "112233", "consumerNumber": "09135792468", "message": "112233 - initial message by 09135792468"}
Meteor.serverFn = {};

Meteor.serverFn.sendEmail = function(to, subject, text) {
    console.log(to);
    console.log(subject);
    console.log(text);
    Email.send({
        to: to,
        from: 'pauline@txtmequick.com',
        subject: subject,
        text: text
    });
}
Meteor.serverFn.sendTwilio = function(from, to, body, attachment) {
    var client = Meteor.npmRequire('twilio')('AC33115a63cdb359f708fb6f8232f88c05', '018616daad465b321ab15867b8934f67');
    var message = {
        to: to,
        from: from,
        body: body,
    };
    if(attachment) message.mediaUrl = 'http://104.131.65.248:3000/files/' + attachment.fileName;
    client.sendMessage(message);
};

Meteor.serverFn.checkConsumer = function(values) {
    var consumer = Consumers.findOne({mobile_number: values.From});
    var business = Businesses.findOne({'numbers.number': values.To});
    var blocked = '0';
    var newIdentity = {
        businessId: business._id,
        first: 'Prospect',
        last: '',
        company: '',
        claimedBy: '',
        updateDT: '',
        updateAgentId: '',
        blocked: blocked,
       isEmployee: '0',
    };
    if(consumer) {//consumer exists
        var identityFound = false;
        for(var x = 0; x < consumer.identity.length; x++) {
            if(consumer.identity[x].businessId == business._id) {
                identityFound = true;
                blocked = consumer.identity[x].blocked;
            }
        }
        
        if(!identityFound) {//identity not found
            consumer.identity.push(newIdentity);
            Consumers.update(consumer._id, {$set: {identity: consumer.identity}});
        }
    } else {//consumer not found
        var consumerId = Consumers.insert({
            country: values.FromCountry,
            languange: 'EN',
            points: 0,
            coins: 0,
            mobile_number: values.From,
            identity: [newIdentity]
        });
    }
    return blocked;
};

Meteor.serverFn.checkAttachment = function(count, url, type) {
    if(parseInt(count) > 0) {
        var http = Meteor.npmRequire('http');
        var fs = Meteor.npmRequire('fs');
        var timestamp = dt.getFullYear() + '_' + (dt.getMonth()+1) + '_' + dt.getDate() + '__' + dt.getHours() + '_' + dt.getMinutes() + '_' + dt.getMilliseconds();
        var extension = '';
        var fileType = '';
        switch(type) {
            case 'video/mp4': extension = 'mp4'; fileType = 'video'; break;
            case 'video/ogg': extension = 'ogg'; fileType = 'video'; break;
            case 'video/webm': extension = 'webm'; fileType = 'video'; break;
            case 'audio/mpeg': extension = 'mp3'; fileType = 'audio'; break;
            case 'audio/wav': extension = 'wav'; fileType = 'audio'; break;
            case 'image/jpg': extension = 'jpg'; fileType = 'image'; break;
            case 'image/gif': extension = 'gif'; fileType = 'image'; break;
            case 'image/png': extension = 'png'; fileType = 'image'; break;
        }
        var fileName = fileType + '__' + timestamp + '.' + extension;
        var dest = '../../../../../.files/' + fileName;
        var file = fs.createWriteStream(dest);
        var request = http.get(url, function(response) {
            response.pipe(file);
            file.on('finish', function() {
                file.close();
            });
        }).on('error', function(err) {
            fs.unlink(dest);
        });
        
        return {fileName: fileName, fileLocation: '/files'};
    }
};

Meteor.serverFn.checkBusinessHours = function(businessNumber, consumerNumber) {
    var sentDate = new Date();
    var businessId = Businesses.findOne({'numbers.number': businessNumber})._id;
    var businessSettings = Settings.findOne({businessId: businessId});
    var sendAutorespond = false;
    if(businessSettings) {
        var autorespond = businessSettings.settings.autorespond;
        if(autorespond) {
            var dayString = Meteor.serverFn.getDayString(sentDate.getDay());
            var day = null;
            for(var x = 0; x < autorespond.days.length; x++) {
                if(autorespond.days[x].day == dayString) day = autorespond.days[x];
            }

            if(day) {
                if(day.open == '1' && day.openHours == '' && day.closeHours == '') sendAutorespond = false;
                else if(day.open == '0' && day.openHours == '' && day.closeHours == '') sendAutorespond = true;
                else if(day.open == '1'){
                    var openHoursDt = new Date();
                    var closeHoursDt = new Date();
                    if(day.openHours == '') {
                        openHoursDt.setHours(0);
                        openHoursDt.setMinutes(0);
                    } else {
                        var openHours = day.openHours.split(':');
                        openHoursDt.setHours(openHours[0]);
                        openHoursDt.setMinutes(openHours[1]);
                    }
                    openHoursDt.setMilliseconds(0);

                    if(day.closeHours == '') {
                        closeHoursDt.setHours(23);
                        closeHoursDt.setMinutes(59);
                    } else {
                        var closeHours = day.closeHours.split(':');
                        closeHoursDt.setHours(closeHours[0]);
                        closeHoursDt.setMinutes(closeHours[1]);
                    }
                    closeHoursDt.setMilliseconds(0);

                    if(sentDate < openHoursDt || sentDate > closeHoursDt) sendAutorespond = true;
                }
            }
        }
    }
    
    if(sendAutorespond) {
        var interaction = {
            businessNumber: businessNumber,
            consumerNumber: consumerNumber,
            message: autorespond.message,
            attachment: null,
            timestamp: Meteor.serverFn.getDateTimeNow(),
            seen: '1',
            fromAgent: '1',
            isAutomated: '1',
            groupId: ''
        };

        Interactions.insert(interaction);
        Meteor.serverFn.sendTwilio(businessNumber, consumerNumber, autorespond.message, null);
    }
};

Meteor.serverFn.checkPoundcodes = function(businessNumber, consumerNumber, message) {
    var firstWord = message.split(' ')[0];
    var sendResponse = false;
    var poundcode = null;
    if(firstWord[0] == '#') {
        var businessId = Businesses.findOne({'numbers.number': businessNumber})._id;
        var businessSettings = Settings.findOne({businessId: businessId});
        if(businessSettings) {
            var poundcodes = businessSettings.settings.poundcodes;
            if(poundcodes) {
                for(var x = 0; x < poundcodes.length; x++) {
                    if(poundcodes[x].code == firstWord) poundcode = poundcodes[x];
                }
                
                if(poundcode) {
                    if(poundcode.expiration) {
                        var today = new Date();
                        var expiration = new Date(poundcode.expiration);
                        if(today < expiration) sendResponse = true;
                    } else sendResponse = true;
                }
            }
        }
    }
    
    if(sendResponse) {
        var interaction = {
            businessNumber: businessNumber,
            consumerNumber: consumerNumber,
            message: poundcode.message,
            attachment: null,
            timestamp: Meteor.serverFn.getDateTimeNow(),
            seen: '1',
            fromAgent: '1',
            isAutomated: '1',
            groupId: ''
        };

        Interactions.insert(interaction);
        Meteor.serverFn.sendTwilio(businessNumber, consumerNumber, poundcode.message, null);
    }
};

Meteor.serverFn.checkOptOut = function(businessNumber, consumerNumber, message) {
    var update = false;
    var consumer = Consumers.findOne({mobile_number: consumerNumber});
    var businessId = Businesses.findOne({'numbers.number': businessNumber})._id;
    for(var x = 0; x < consumer.identity.length; x++) {
        if(consumer.identity[x].businessId = businessId) {
            if((message == 'STOP' || message == 'STOP ALL') && consumer.identity[x].optedOut != '1') {
                consumer.identity[x].optedOut = '1';
                consumer.identity[x].optedBy = 'consumer';
                consumer.identity[x].optedTimestamp = Meteor.serverFn.getDateTimeNow();
                update = true;
            } else if(message != 'STOP' || message != 'STOP ALL' && consumer.identity[x].optedOut != '0') {
                consumer.identity[x].optedOut = '0';
                consumer.identity[x].optedBy = 'consumer';
                consumer.identity[x].optedTimestamp = Meteor.serverFn.getDateTimeNow();
                update = true;
            }
        }
    }
    if(update) Consumers.update(consumer._id, {$set: {identity: consumer.identity}});
};

Meteor.serverFn.checkGroupBreak = function(businessNumber, consumerNumber, message) {
    var update = false;
    var consumer = Consumers.findOne({mobile_number: consumerNumber});
    var businessId = Businesses.findOne({'numbers.number': businessNumber})._id;
    var identity = false;
    for(var x = 0; x < consumer.identity.length; x++) {
        if(consumer.identity[x].businessId = businessId) identity = consumer.identity[x];
    }
    
    if(message == 'BREAK') {
        var group = GroupConversations.findOne({consumers: {$in: [consumerNumber]}, active: '1'});
        if(group) {
            Meteor.call('leaveGroup', group._id);
    
            var interaction = {
                businessNumber: businessNumber,
                consumerNumber: '',
                message: identity.first + ' ' + identity.last + ' has left the group.',
                attachment: null,
                timestamp: Meteor.serverFn.getDateTimeNow(),
                seen: '1',
                fromAgent: '1',
                isAutomated: '1',
                groupId: group._id
            };

            Interactions.insert(interaction);
        }
    }
};

Meteor.serverFn.getDayString = function (day) {
    var weekday = new Array(7);
    weekday[0] = 'sunday';
    weekday[1] = 'monday';
    weekday[2] = 'tuesday';
    weekday[3] = 'wednesday';
    weekday[4] = 'thursday';
    weekday[5] = 'friday';
    weekday[6] = 'saturday';

    return weekday[day];
};
    
Meteor.serverFn.getDateTimeNow = function() {
    var dt = new Date();
    var seconds = dt.getMilliseconds() + '';
    if(seconds[1]) {}
    else {
        seconds[1] = (seconds[0]) ? seconds[0] : '0';
        seconds[0] = '0';
    }
    return dt.getFullYear() + '-' + Meteor.serverFn.addZero(dt.getMonth()+1) + '-' + Meteor.serverFn.addZero(dt.getDate()) + ' ' + Meteor.serverFn.addZero(dt.getHours()) + ':' + Meteor.serverFn.addZero(dt.getMinutes()) + ':' + seconds[0] + seconds[1];
};

Meteor.serverFn.addZero = function(number) {
    if(number < 10) return '0' + number;
    else return number;
};

Meteor.serverFn.checkEventSchedules = function() {
    var businesses = Settings.find().fetch();
    for(var x = 0; x < businesses.length; x++) {
        var business = businesses[x];
        var businessSettings = business.settings;
        var eventscheduler = businessSettings.eventscheduler;
        if(eventscheduler) {
            var message = eventscheduler.message;
            var includeTimestamp = eventscheduler.includeTimestamp;
            var hoursAdvance = parseInt(eventscheduler.hoursAdvance);
            
            var calendarEvents = CalendarEvents.findOne({businessId: business.businessId});
            if(calendarEvents) {
                var events = calendarEvents.events;
                var now = new Date();
                var nowPlus5mins = new Date(now.getTime() + (5 * 60 * 1000));
                var sortedEvents = events.sort(function (a, b) {
                    var aUrgent = (a.urgent == '1') ? 'a' : 'b';
                    var bUrgent = (b.urgent == '1') ? 'a' : 'b';
                    if((a.start + '-' + aUrgent) < (b.start + '-' + bUrgent)) return -1;
                    else if((a.start + '-' + aUrgent) > (b.start + '-' + bUrgent)) return 1;
                    else return 0;
                });
                for(var y = 0; y < sortedEvents.length; y++) {
                    var event = sortedEvents[y];
                    var eventStart = new Date(event.start.replace(/-/g, "/"));
                    var startMinusHoursAdvance = new Date(eventStart.getTime() - (hoursAdvance * 60 * 60 * 1000));
                    if((startMinusHoursAdvance >= now && startMinusHoursAdvance <= nowPlus5mins && event.sent != '1') || 
                       (startMinusHoursAdvance < now && event.sent != '1')) {
                        var lastInteraction = Interactions.find({consumerNumber: event.consumerNumber}, {sort: {timestamp: -1}}).fetch();
                        var businessNumber = event.businessNumber;
                        if(lastInteraction) businessNumber = lastInteraction[0].businessNumber;
                        var reminderMessage = message + ': ' + event.title + ' - ' + event.description;
                        if(includeTimestamp == '1') reminderMessage += ' @ ' + event.start;
                        var interaction = {
                            businessNumber: businessNumber,
                            consumerNumber: event.consumerNumber,
                            message: reminderMessage,
                            attachment: null,
                            timestamp: Meteor.serverFn.getDateTimeNow(),
                            seen: '1',
                            fromAgent: '1',
                            isAutomated: '1',
                            groupId: ''
                        };

                        Interactions.insert(interaction);
                        Meteor.serverFn.sendTwilio(businessNumber, event.consumerNumber, reminderMessage, null);
                        sortedEvents[y].sent = '1';
                    }
                }
                CalendarEvents.update(calendarEvents._id, {$set: {events: sortedEvents}});
            }
        }
    }
};

Meteor.serverFn.merge_options = function(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
    return obj3;
};