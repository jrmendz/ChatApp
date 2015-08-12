BaseController = RouteController.extend({
    layoutTemplate: 'layout',
    loadingTemplate: 'loading',
    yieldTemplates: {
        'menu': {to: 'menu'}
    },
});

InteractionsController = BaseController.extend({
    waitOn: function () {
        var user = Meteor.user();
        var businessId = null;
        if(user) {
            if(user.profile) businessId = user.profile.businessId;
        }
        return [
            Meteor.subscribe('agents'), 
            Meteor.subscribe('consumers'), 
            Meteor.subscribe('notes', businessId), 
            Meteor.subscribe('group_conversations'), 
            Meteor.subscribe('forwarded_conversations', Session.get('businessNumber')), 
            Meteor.subscribe('businesses'), 
            Meteor.subscribe('calendar_events', businessId), 
            Meteor.subscribe('interactions')
        ];
    },
});

ConsumersController = BaseController.extend({
    waitOn: function () {
        var user = Meteor.user();
        var businessId = null;
        if(user) {
            if(user.profile) businessId = user.profile.businessId;
        }
        return [
            Meteor.subscribe('business_settings', businessId), 
            Meteor.subscribe('agents'), 
            Meteor.subscribe('consumers'), 
            Meteor.subscribe('importlogs'),
			Meteor.subscribe('tempdb'), 
            Meteor.subscribe('temphd'), 
            Meteor.subscribe('selected_header')
        ];
    },
    data: function() {
        return {
            consumers : Consumers.find(),
            getInfo : Consumers.find({mobile_number: Session.get('consumer_no')})
        }
    }
});

SearchController = BaseController.extend({
    waitOn: function () {
        if(Session.equals('isChecked','isChecked')){
            Meteor.subscribe("searchConversation",Session.get('searchStr'));   
        }else{
            Meteor.subscribe("searchConsumer",Session.get('searchStr'));
        }
    }
});

BroadcastController = BaseController.extend({
    waitOn: function () {
        return [
            Meteor.subscribe('businesses'), 
            Meteor.subscribe('agents'),  
            Meteor.subscribe('consumer_groups'), 
            Meteor.subscribe('consumers'), 
            Meteor.subscribe('interactions')
        ];
    }
});

CalendarController = BaseController.extend({
    waitOn: function () {
        return Meteor.subscribe('calendar_events');
    },
});

TasksController = BaseController.extend({
    waitOn: function () {
        return [
            Meteor.subscribe('agents'), 
            Meteor.subscribe('tasks'), 
            Meteor.subscribe('task_comments'), 
            Meteor.subscribe('task_files')
        ];
    },
});

PresenceController = BaseController.extend({
    waitOn: function () {
        return Meteor.subscribe('agents');
    },
});

SettingsController = BaseController.extend({
    waitOn: function () {
        return Meteor.subscribe('settings');
    },
});

TMQStaffsController = BaseController.extend({
    layoutTemplate: 'tmqLayout',
    yieldTemplates: {
        'tmqMenu': {to: 'tmqMenu'}
    },
    waitOn: function () {
        return Meteor.subscribe('tmq_staffs');
    },
});

TMQBusinessesController = BaseController.extend({
    layoutTemplate: 'tmqLayout',
    yieldTemplates: {
        'tmqMenu': {to: 'tmqMenu'}
    },
    waitOn: function () {
        return [Meteor.subscribe('businesses')], Meteor.subscribe('agents');
    },
});

Router.map( function () {
    this.route('login', {
        path: '/login',
        action: function() {
            var user = Meteor.user();
            if(user) {
                if(user.profile.type == 'agent') Router.go('businessNumberLogin');
                else if(user.profile.type == 'staff') this.render('login');
            } else this.render('login');
        }
    });
    this.route('businessNumberLogin', {
        path: '/business-number-login',
        action: function() {
            if(Session.get('businessNumber')) Router.go('interactions');
            else this.render('businessNumberLogin')
        }
    });
    this.route('home', {
        path: '/',
        controller: 'BaseController',
        template: 'home'
    });
    this.route('interactions', {
        path: '/interactions',
        controller: 'InteractionsController',
        template: 'interactions'
    });
    this.route('consumers', {
        path: '/consumers',
        controller: 'ConsumersController',
        template: 'consumers'
    });
    this.route('search',{
        path: '/search',
        controller: 'SearchController',
        template: 'search'
    });
    this.route('broadcast', {
        path: '/broadcast',
        controller: 'BroadcastController',
        template: 'broadcast'
    });
    this.route('calendar', {
        path: '/calendar',
        controller: 'CalendarController',
        template: 'calendar'
    });
    this.route('tasks', {
        path: '/tasks',
        controller: 'TasksController',
        template: 'tasks'
    });
    this.route('presence', {
        path: '/presence',
        controller: 'PresenceController',
        template: 'presence'
    });
    this.route('autorespondSettings', {
        path: '/autorespond',
        controller: 'SettingsController',
        template: 'autorespond'
    });
    this.route('poundcodeSettings', {
        path: '/txtcodes',
        controller: 'SettingsController',
        template: 'poundcode'
    });
    this.route('eventschedulerSettings', {
        path: '/event-scheduler',
        controller: 'SettingsController',
        template: 'eventscheduler'
    });
    this.route('settings', {
        path: '/settings',
        controller: 'SettingsController',
        template: 'settings'
    });
    this.route('tmqLogin', {
        path: '/tmq-login',
        action: function() {
            var user = Meteor.user();
            if(user) {
                if(user.profile.type == 'staff') Router.go('tmqBusinesses');
                else if(user.profile.type == 'agent') this.render('tmqLogin');
            } else this.render('tmqLogin');
        }
    });
    this.route('tmqStaffs', {
        path: '/tmq/staffs',
        controller: 'TMQStaffsController',
        template: 'tmqStaffs'
    });
    this.route('tmqBusinesses', {
        path: '/tmq/businesses',
        controller: 'TMQBusinessesController',
        template: 'tmqBusinesses'
    });
});