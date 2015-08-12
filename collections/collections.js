Businesses = new Mongo.Collection('businesses');
Consumers = new Mongo.Collection('consumers');
Interactions = new Mongo.Collection('interactions');
ConsumerGroups = new Mongo.Collection('consumer_groups');
Notes = new Mongo.Collection('notes');
CalendarEvents = new Mongo.Collection('calendar_events');
GroupConversations = new Mongo.Collection('group_conversations');
ForwardedConversations = new Mongo.Collection('forwarded_conversations');
Tasks = new Mongo.Collection('tasks');
TaskFiles = new Mongo.Collection('task_files');
TaskComments = new Mongo.Collection('task_comments');
Settings = new Mongo.Collection('settings');
UploadedCSV = new Mongo.Collection('temp_database');
TempHeaders = new Mongo.Collection('temp_header');
SelectedHeaders = new Mongo.Collection('selected_header');
ImportLogs = new Mongo.Collection('importlogs');