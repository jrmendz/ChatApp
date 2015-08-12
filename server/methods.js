Meteor.methods({
    checkBusinessNumber: function (agentId, businessNumber) {
        var businessId = Meteor.users.findOne(agentId).profile.businessId;
        var business = Businesses.findOne(businessId);
        var numberFound = '0';
        for(var x = 0; x < business.numbers.length; x++) {
            if(business.numbers[x].number == businessNumber && business.numbers[x].retired != '1') numberFound = '1';
        }
        return numberFound;
    },
    insertInteraction: function (interaction) {
        interaction.seen = '1';
        interaction.fromAgent = '1';
        interaction.timestamp = Meteor.serverFn.getDateTimeNow();
        Interactions.insert(interaction);
        //TODO: send to all participating consumers if group
        Meteor.serverFn.sendTwilio(interaction.businessNumber, interaction.consumerNumber, interaction.message, interaction.attachment);
    },
    updateConsumerIdentity: function (businessId, consumerNumber, key, value) {
        var consumer = Consumers.findOne({mobile_number: consumerNumber});
        var identity = consumer.identity;
        for(var x = 0; x < identity.length; x++) {
            if(identity[x].businessId == businessId) identity[x][key] = (value == ':timestamp') ? Meteor.serverFn.getDateTimeNow() : value;
        }
        Consumers.update(consumer._id, {$set: {identity: identity}});
    },
    insertGroupConversation: function (businessNumber, agentId, agents, consumers) {
        var groupId = GroupConversations.insert({
            businessNumber: businessNumber,
            createdBy: agentId,
            createdAt: Meteor.serverFn.getDateTimeNow(),
            agents: agents,
            consumers: consumers,
            active: '1'
        });
        
        var interaction = {
            businessNumber: businessNumber,
            consumerNumber: '',
            message: 'Group created.',
            attachment: null,
            timestamp: Meteor.serverFn.getDateTimeNow(),
            seen: '1',
            fromAgent: '1',
            isAutomated: '1',
            groupId: groupId
        };

        Interactions.insert(interaction);
    },
    updateGroupConversation: function(groupId, values) {
        GroupConversations.update(groupId, {$set: values});
    },
    leaveGroup: function(groupId, consumerNumber) {
        var group = GroupConversations.findOne(groupId);
        var consumers = group.consumers;
        var index = false;
        for(var x = 0; x < consumers.length; x++) {
            if(consumers[x] == consumerNumber) index = x;
        }
        
        consumers.splice(index, 1);
        GroupConversations.update(groupId, {$set: {consumers: consumers}});
    },
//    updateClaimedBy: function (businessId, agentId, consumerNumber) {
//        var consumer = Consumers.findOne({mobile_number: consumerNumber});
//        var identity = consumer.identity;
//        for(var x = 0; x < identity.length; x++) {
//            if(identity[x].businessId == businessId) identity[x].claimedBy = agentId;
//        }
//        Consumers.update(consumer._id, {$set: {identity: identity}});
//    },
//    updateBlocked: function (businessId, consumerNumber, blocked) {
//        var consumer = Consumers.findOne({mobile_number: consumerNumber});
//        var identity = consumer.identity;
//        for(var x = 0; x < identity.length; x++) {
//            if(identity[x].businessId == businessId) identity[x].blocked = blocked;
//        }
//        Consumers.update(consumer._id, {$set: {identity: identity}});
//    },
    interactionSeen: function (condition) {
        Interactions.update(condition, {$set: {seen: '1'}}, {multi: true});
    },
    loginUser: function (userId) {
        Meteor.users.update(userId, {$set: {'profile.online': '1'}});
    },
    logoutUser: function (userId) {
        Meteor.users.update(userId, {$set: {'profile.online': '0'}});
    },
    addCalendarEvent: function (businessId, event) {
        var calendarEvents = CalendarEvents.findOne({businessId: businessId});
        if(calendarEvents) {
            var events = calendarEvents.events;
            events.push(event);
            CalendarEvents.update(calendarEvents._id, {$set: {events: events}});
        } else CalendarEvents.insert({businessId: businessId, events: [event]});
    },
    updateCalendarEvent: function (businessId, eventId, event) {
        var calendarEvents = CalendarEvents.findOne({businessId: businessId});
        var events = calendarEvents.events;
        var index = null;
        for(var x = 0; x < events.length; x++) {
            if(events[x]._id == eventId) index = x;
        }
        events[index] = event;
        CalendarEvents.update(calendarEvents._id, {$set: {events: events}});
    },
    removeCalendarEvent: function (businessId, eventId) {
        var calendarEvents = CalendarEvents.findOne({businessId: businessId});
        var events = calendarEvents.events;
        var index = null;
        for(var x = 0; x < events.length; x++) {
            if(events[x]._id == eventId) index = x;
        }
        events.splice(index, 1);
        CalendarEvents.update(calendarEvents._id, {$set: {events: events}});
    },
    addCommonNote: function (businessId, agentId, consumerNumber, newNote, type) {
        var notes = Notes.findOne({businessId: businessId, consumerNumber: consumerNumber});
        newNote.createdAt = Meteor.serverFn.getDateTimeNow();
        newNote.createdBy = agentId;
        console.log(notes);
        if(notes) {
            var consumerNotes = notes.consumerNotes;
            var messageNotes = notes.messageNotes;
            if(type == 'consumer') {
                if(consumerNotes) consumerNotes.push(newNote);
                else consumerNotes = [newNote];
                
                Notes.update(notes._id, {$set: {consumerNotes: consumerNotes}});
            } else if(type == 'message') {
                if(messageNotes) messageNotes.push(newNote);
                else messageNotes = [newNote];
                
                Notes.update(notes._id, {$set: {messageNotes: messageNotes}});
            }
        } else {
            var noteDoc = {
                businessId: businessId,
                consumerNumber: consumerNumber
            };
            
            if(type == 'consumer') noteDoc.consumerNotes = [newNote];
            else if(type == 'message') noteDoc.messageNotes = [newNote];
            
            Notes.insert(noteDoc);
        }
    },
    removeCommonNote: function (businessId, agentId, consumerNumber, indexOrIdTimestamp, type) {
        console.log(indexOrIdTimestamp);
        var notes = Notes.findOne({businessId: businessId, consumerNumber: consumerNumber});
        var updatedNotes;
        var index;
        if(type == 'consumer') {
            index = indexOrIdTimestamp;
            updatedNotes = notes.consumerNotes;
        } else if(type == 'message') {
            updatedNotes = notes.messageNotes;
            for(var x = 0; x < updatedNotes.length; x++) {
                if(updatedNotes[x].interactionId + updatedNotes[x].createdAt == indexOrIdTimestamp) index = x;
            }
        }
        
        updatedNotes[index].deleted = '1';
        updatedNotes[index].deletedAt = Meteor.serverFn.getDateTimeNow();
        updatedNotes[index].deletedBy = agentId;
        
        var values = {consumerNotes: updatedNotes};
        if(type == 'message') values = {messageNotes: updatedNotes};
        
        Notes.update(notes._id, {$set: values});
    },
    transferClaim: function (businessId, consumerNumber, claimedBy, transferInvite) {
        var consumer = Consumers.findOne({mobile_number: consumerNumber});
        var identity = consumer.identity;
        for(var x = 0; x < identity.length; x++) {
            if(identity[x].businessId == businessId) {
                if(claimedBy) identity[x].claimedBy = claimedBy;
                if(transferInvite != '') identity[x].transferInviteTimestamp = Meteor.serverFn.getDateTimeNow();
                else identity[x].transferInviteTimestamp = '';
                identity[x].transferInvite = transferInvite;
            }
        }
        Consumers.update(consumer._id, {$set: {identity: identity}});
    },
    forwardMessage: function(forward) {
        forward.createdAt = Meteor.serverFn.getDateTimeNow();
        ForwardedConversations.insert(forward);
        
        if(forward.type == 'both' || forward.type == 'number') {
            Meteor.serverFn.sendTwilio(forward.businessNumber, forward.number, forward.message, null);
        }
        
        if(forward.type == 'both' || forward.type == 'email') {
            Meteor.serverFn.sendEmail(forward.email, 'Forwarded Message', forward.message);
        }
    },
    insertGroup: function(businessId, values) {
        var consumerGroups = ConsumerGroups.findOne({businessId: businessId});
        if(consumerGroups) {
            consumerGroups.groups.push(values);
            ConsumerGroups.update(consumerGroups._id, {$set: {groups: consumerGroups.groups}});
        } else ConsumerGroups.insert({
            businessId: businessId,
            groups: [values]
        });
    },
    updateGroup: function(businessId, index, values) {
        var consumerGroups = ConsumerGroups.findOne({businessId: businessId});
        consumerGroups.groups[index] = values;
        ConsumerGroups.update(consumerGroups._id, {$set: {groups: consumerGroups.groups}});
    },
    removeGroup: function(businessId, index) {
        var consumerGroups = ConsumerGroups.findOne({businessId: businessId});
        consumerGroups.groups.splice(index, 1);
        ConsumerGroups.update(consumerGroups._id, {$set: {groups: consumerGroups.groups}});
    },
    autorespond: function(businessId, values) {
        var business = Settings.findOne({businessId: businessId});
        if(business) Settings.update({businessId: businessId}, {$set: {'settings.autorespond': values}});
        else Settings.insert({
            businessId: businessId,
            settings: {
                autorespond: values
            }
        });
    },
    poundcodes: function(businessId, values) {
        var business = Settings.findOne({businessId: businessId});
        if(business) Settings.update({businessId: businessId}, {$set: {'settings.poundcodes': values}});
        else Settings.insert({
            businessId: businessId,
            settings: {
                poundcodes: values
            }
        });
    },
    eventscheduler: function(businessId, values) {
        var business = Settings.findOne({businessId: businessId});
        if(business) Settings.update({businessId: businessId}, {$set: {'settings.eventscheduler': values}});
        else Settings.insert({
            businessId: businessId,
            settings: {
                eventscheduler: values
            }
        });
    },
    defaultSettings: function(businessId, values) {
        var business = Settings.findOne({businessId: businessId});
        if(business) Settings.update({businessId: businessId}, {$set: {'settings.defaults': values}});
        else Settings.insert({
            businessId: businessId,
            settings: {
                defaults: values
            }
        });
    },
    insertBusiness: function(values) {
        values.suspended = '0';
        return Businesses.insert(values);
    },
    updateBusiness: function(businessId, values) {
        Businesses.update(businessId, {$set: values});
    },
    suspendBusiness: function(businessId, values) {
        Businesses.update(businessId, {$set: {suspended: '1'}});
    },
    insertUser: function(values) {
        var password = 'test1234';
        var userId = Accounts.createUser({
            username: values.username,
            email: values.profile.email,
            password: password
        });
        values.profile.online = '0';
        Meteor.users.update(userId, {$set: values});
    },
    updateUser: function(userId, values) {
        values['emails.0.address'] = values.profile.email;
        Meteor.users.update(userId, {$set: values});
    },
    removeUser: function(userId, values) {
        Meteor.users.remove(userId);
    },
    retireUser: function(userId) {
        Meteor.users.update(userId, {$set: {'profile.retired': '1'}});
    },
//    sendEmail: function (to, subject, text) { 
//        this.unblock();
//        console.log(to);
//        console.log(subject);
//        console.log(text);
//        Email.send({
//            to: to,
//            from: 'pauline@txtmequick.com',
//            subject: subject,
//            text: text
//        });
//    },
    sendLoginDetails: function (email, username) { 
        Meteor.serverFn.sendEmail(email, 'Account Login Details', 'Login using your username: ' + username + '; and password: test1234');
//        Meteor.call('sendEmail', email, 'Account Login Details', 'Login using your username: ' + username + '; and password: test1234');
        console.log('Login details sent to: ' + email);
    },
    
    'updateFavorite': function(taskId) {
        var task = Tasks.findOne(taskId);
        if(task.is_favorite == '1') Tasks.update(taskId, {$set: {is_favorite: '0'}});
        else Tasks.update(taskId, {$set: {is_favorite: '1'}});
    },
    'updateDueDate': function(taskId, timestamp) {
        Tasks.update(taskId, {$set: {due_date: timestamp}});
    },
    'updateRemindDate': function(taskId, timestamp) {
        Tasks.update(taskId, {$set: {remind_date: timestamp}});
    },
    'updateNote': function(taskId, note) {
        Tasks.update(taskId, {$set: {note: note}});
    },
    'removeFile': function(fileId) {
        TaskFiles.remove(fileId);
    },
    'updateTask': function(taskId, isDone) {
        Tasks.update(taskId, {$set: {is_done: isDone} });
    },
    'addSubtask': function(taskId, subtaskName) {
        var task = Tasks.findOne(taskId);
        var subtasks = task.sub_tasks;
        subtasks.push({name: subtaskName, is_done: '0'});
        Tasks.update(taskId, {$set: {sub_tasks: subtasks} });
    },
    'updateSubtask': function(taskId, subtaskIdx, isDone) {
        var task = Tasks.findOne(taskId);
        var subtasks = task.sub_tasks;
        subtasks[subtaskIdx].is_done = isDone;
        Tasks.update(taskId, {$set: {sub_tasks: subtasks} });
    },
    'removeSubtask': function(taskId, subtaskIdx) {
        var task = Tasks.findOne(taskId);
        var subtasks = task.sub_tasks;
        subtasks.splice(subtaskIdx, 1);
        Tasks.update(taskId, {$set: {sub_tasks: subtasks} });
    },
    'undoneSubtask': function(taskId) {
        Tasks.update(taskId, {$set: {sub_tasks: subtasks} });
    },
    'doneSubtask': function(taskId) {
        Tasks.update(taskId, {$set: {sub_tasks: subtasks} });
    },
    'removeTask': function(taskId) {
        Tasks.update(taskId, {$set: {active: '0'}});
    },
    'addComment': function(taskId, comment, userId) {
        TaskComments.insert({
            task_id: taskId,
            user_id: userId,
            timestamp: new Date(),
            comment: comment
        });
    },
    'removeComment': function(commentId) {
        TaskComments.remove(commentId);
    },
    
    //jr's code
    'insertConsumer' : function(params){
       data = {
           country : params.country,
           language: params.language,
           points: 0,
           coins: 0,
           mobile_number: params.mobile,
           identity: [
                {
                    businessId: params.bid,
                    first: params.fname,
                    last: params.lname,
                    company: params.company,
					account_no: params.accno,
					address: params.add,
					state: params.state,
					city: params.city,
					email: params.email,
					link: params.link,
                    claimedBy: '',
                    blocked: '0',
                   isEmployee: params.isEmployee,
                }
           ]
       }
       Consumers.insert(data);
   },
   'updateDuplicate' : function(params){
   		var found = Consumers.findOne({'mobile_number':params.mobile, identity:{$elemMatch:{businessId: params.bid}}});
		if(!found){
			data =	{
				businessId: params.bid,
				first: params.fname,
				last: params.lname,
				company: params.company,
				account_no: params.accno,
				address: params.add,
				state: params.state,
				city: params.city,
				email: params.email,
				link: params.link,
				claimedBy: '',
               isEmployee: params.isEmployee,
	        };
            
			Consumers.update({
				mobile_number: params.mobile},
				{$push: {identity: data}}
			);
		}else{
			console.error('Attempt to replace existing data err found!');
		}
   },
   'updateConsumers' : function(params){
   		var found = Consumers.findOne({'mobile_number':params.mobile, identity:{$elemMatch:{businessId: params.bid}}});
		if(found){
			var datemod = Meteor.serverFn.getDateTimeNow();
			var newIdentity = new Array();
			data =	{
				updateDT: datemod,
				updateAgentId: params.aid,
				businessId: params.bid,
				first: params.fname,
				last: params.lname,
				company: params.company,
				account_no: params.accno,
				address: params.add,
				state: params.state,
				city: params.city,
				email: params.email,
				link: params.link,
				claimedBy: '',
               isEmployee: params.isEmployee,
		       };
			   for(var x=0; x<found.identity.length; x++){
			   		if(found.identity[x].businessId === params.bid){
						found.identity[x] = data;
						break;
			   		}
			   }
			   newIdentity = found.identity;
			   Consumers.update(
					{
					mobile_number: params.mobile,
					identity: {$elemMatch:
							{
							businessId: params.bid
							}
						}
					}, {
					$set: {
						country: params.country,
						language: params.language,
                        isEmployee: params.isEmployee,
						identity:  newIdentity
						}
					}
				);
		}else{
			console.error('Attempt to edit non existing data err found!');
		}
   },

   /*[rudolp]*/
   'insertSelected': function(v, c, bid, aid) {
		SelectedHeaders.insert({value: v, index: c, bid: bid, aid: aid});
	},
	'removeSelected': function(c, bid, aid) {
		SelectedHeaders.remove({index: c, bid: bid, aid: aid})
	},
   'clearTempDB': function(){
   		UploadedCSV.remove({});
		TempHeaders.remove({});
		SelectedHeaders.remove({});
		ImportLogs.remove({});
   },
   'uploadFile': function (filename, bid, aid) {
		Meteor.setTimeout(function()
		{
			var headers = "abcdefghijklmnopqrstuvwxyz".split('');
			var filepath = '../../../../../.files/' + filename;
			var fs = Npm.require('fs');
			var path = Npm.require('path');
			var data = new Array();
			Meteor.call('clearTempDB');
			UploadedCSV.insert({bid: bid, aid: aid});
			CSV().from.stream(
				fs.createReadStream(filepath),
				{'escape': '\\'}).on('record', Meteor.bindEnvironment(function(row, index)
					{
						data[index] = {};
						for(var i = 0; i< headers.length; i++) {
							if(row[i]) {
								var code = 'data[' + index + '].' + headers[i] + '= "' + row[i] + '"';
								eval(code);
							}
						}
						data[index].index = index-1;
					}
				)
			).on('error', function(error) {
					console.error('Error streaming CSV export: ', error.message);
				}
			).on('end', Meteor.bindEnvironment(function(count)
				{
					UploadedCSV.update({bid: bid, aid: aid}, {$set: {entries: data}});
					var newh = UploadedCSV.findOne();
					if(newh && newh.entries) {
						for(var i = 0; i < headers.length; i++) {
							var h = eval('newh.entries[0].' + headers[i]);
							if(h){
								TempHeaders.insert({name: h, index: i, bid: bid, aid: aid});
							}
						}
					}
					UploadedCSV.update({bid: bid, aid: aid}, {$unset : {"entries.0" : 1 }});
				    UploadedCSV.update({bid: bid, aid: aid}, {$pull : {"entries" : null}});
				}));
		}, 500);
   },
   'startImport': function(bid, aid) {
		var headers = SelectedHeaders.find();
		var h = "abcdefghijklmnopqrstuvwxyz".split('');
		var db = UploadedCSV.findOne({bid: bid, aid: aid});
		var newEntries = 0;
		var updatedEntries = 0;
		if(!db || !db.entries)
			return;
		/* Filter */
		db.entries.forEach(function(data)
			{
				if(!data)
					return;
				var c = new Object();
				var e = {
				country: "",
				language: "EN",
				points: 0,
				coins: 0,
				mobile_number: null
				};
				e.identity = new Array();
				e.identity[0] = new Object();
				headers.forEach(function(d)
					{
						if(d.value == 'mobile_number') {
							e.mobile_number = eval('data.' + h[d.index]);
							e.mobile_number = e.mobile_number.replace(/[^\/\d]/g,'');
							if(e.mobile_number.length>10)
								e.mobile_number = e.mobile_number.substring(1);
						}else if(d.value == 'language') {
							e.language = eval('data.' + h[d.index]);
						}else if(d.value == 'country') {
							e.country = eval('data.' + h[d.index]);
						}else {
							code = 'e.identity[0].' + d.value + ' =  data.' + h[d.index];
							eval(code);
						}
						code = 'c.' + h[d.index] + ' =  data.' + h[d.index];
						eval(code);
					}
				);
				if(e.mobile_number) {
					var found = Consumers.findOne({mobile_number: e.mobile_number});
					e.identity[0].claimedBy = "";
					e.identity[0].updateDT = "";
					e.identity[0].updateAgentId = "";
                    e.identity[0].isEmployee = '0';
					if(!found) {
						e.identity[0].businessId = db.bid;
						Consumers.insert(e);
						newEntries++;
					}else {
						var f = Consumers.findOne(
							{
							mobile_number: found.mobile_number,
							identity: {$elemMatch:
									{
									businessId: db.bid
									}
								}
							}
						);
						if(f) {
							var datemod = Meteor.serverFn.getDateTimeNow();
							e.identity[0].updateDT = datemod;
							e.identity[0].updateAgentId = db.aid;
							for(var fi = 0; fi<f.identity.length; fi++) {
								var f1 = f.identity[fi].businessId;
								var f2 = db.bid;
								if( f1 === f2 ) {
									modified = Meteor.serverFn.merge_options(f.identity[fi], e.identity[0]);
									f.identity[fi] = modified;
									break;
								}
							}
							var newIdentity = f.identity;
							Consumers.update(
								{
								mobile_number: found.mobile_number,
								identity: {$elemMatch:
										{
										businessId: db.bid
										}
									}
								}, {
								$set: {
									identity: newIdentity
									}
								}
							);
							updatedEntries++;
						}else {
							e.identity[0].businessId = db.bid;
							Consumers.update(
								{
								mobile_number: found.mobile_number},
								{
								$push: {identity: e.identity[0]}
								}
							);
							updatedEntries++;
						}
					}
					var code = 'UploadedCSV.update({bid: bid, aid: aid}, {$unset : {"entries.' + data.index + '" : 1 }});';
					eval(code);
				}else {
					ImportLogs.insert({log: "Missing mobile no!(" + e + ")"});
				}
			}
		);
		ImportLogs.insert({log: "Inserted " + newEntries + " entries."});
		ImportLogs.insert({log: "Updated " + updatedEntries + " entries."});
	},
});