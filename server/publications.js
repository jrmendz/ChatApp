Meteor.publish('agents', function(){
    return Meteor.users.find({'profile.type': 'agent'});
});

Meteor.publish('businesses', function(){
    return Businesses.find();
});

Meteor.publish('business_settings', function(businessId){
    return Settings.find({businessId: businessId});
});

Meteor.publish('consumers', function(){
    return Consumers.find();
});

Meteor.publish('consumer_groups', function(){
    return ConsumerGroups.find();
});

Meteor.publish('interactions', function(){
    return Interactions.find();
});

Meteor.publish('calendar_events', function(businessId){
    return CalendarEvents.find({businessId: businessId});
});

Meteor.publish('notes', function(businessId){
    return Notes.find({businessId: businessId});
});

Meteor.publish('group_conversations', function(){
    return GroupConversations.find({agents: {$in: [this.userId]}});
});

Meteor.publish('forwarded_conversations', function(businessNumber){
    return ForwardedConversations.find({businessNumber: businessNumber});
});

Meteor.publish('tasks', function(){
    return Tasks.find();
});

Meteor.publish('task_files', function(){
    return TaskFiles.find({task_id: '55958d46efeaf3f04989d487'});
});

Meteor.publish('task_comments', function(){
    return TaskComments.find({task_id: '55958d46efeaf3f04989d487'});
});

Meteor.publish('settings', function(){
    return Settings.find();
});

Meteor.publish('tmq_staffs', function(){
    return Meteor.users.find({'profile.type': 'staff'});
});

Meteor.publish('tempdb', function(){
    return UploadedCSV.find({});
});

Meteor.publish('temphd', function(){
    return TempHeaders.find({});
});

Meteor.publish('selected_header', function(){
	return SelectedHeaders.find({});
});

Meteor.publish('importlogs', function(){
	return ImportLogs.find({});
});

Meteor.publish('searchConsumer', function(params){
   if(params){
       return Consumers.find({$or:[{'identity.first': RegExp(params,'i')},{'identity.last': RegExp(params,'i')},{'identity.company': RegExp(params,'i')},{mobile_number: RegExp(params,'i')}]});    
   }else{
       return "";
   }
});

Meteor.publish('searchConversation', function(params){
    console.log(params);
   if(params){
       return Interactions.find({$or:[{businessNumber: RegExp(params,'i')},{consumerNumber: RegExp(params,'i')},{message: RegExp(params,'i')}]});   
   }else{
       return "";
   }
});