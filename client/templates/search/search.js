Template.search.rendered = function(){
    Session.set('isChecked',null);   
}
Template.search.events({
   'keyup #search': _.throttle(function(e){
//        e.preventDefault();
        text = $('#search').val();
        Session.set('searchStr',text);
   },1000),
   "click #messageChkbox" : function(){
        Session.set('isChecked',null);
        if ($("#messageChkbox").is(':checked')) {
            Session.set('isChecked','isChecked');
        } else {
            Session.set('isChecked',null);
        }
   },
   'click .consumer-no': function(){
        var consumer_no = this.mobile_number;
        Session.set('consumer_no',null);
        Session.set('consumer_no',consumer_no);
        Session.set('mode',null); 
        $('.editConsumer').prop( "disabled", false );
        
    },
    'click .addConsumer' : function(){
        Session.set('mode','isAdd');  
        Session.set('consumer_no',null);
        $('.editConsumer').prop( "disabled", true );
    },
    'click .editConsumer' : function(){
        Session.set('mode','isEdit');  
    },
    'change #countries' : function(){
        var country = $('#countries').val();
        Session.set('country',country);
    },
    'submit #addForm' : function(event){
        event.preventDefault();
        var fname = event.target.fname.value;
        var lname = event.target.lname.value;
        var company = event.target.company.value;
        var mobile = event.target.mobileNo.value;
        var bid = event.target.businessId.value;
        Session.set('consumer_no',mobile);
        console.log(bid);
        data = {
            fname: fname,
            lname: lname,
            country: Session.get('country'),
            language: 'EN',
            points: 0,
            coins: 0,
            mobile: mobile,
            company: company,
            count : Session.get('count')
        }
        if(Consumers.find().count() === 0){
            Meteor.call('insertConsumer',data);  
            $('#addForm')[0].reset();
        }else{
            
            
            var businessId = Meteor.user().profile.businessId;
            var duplicateMobile = Consumers.findOne({'mobile_number':mobile});
            if(duplicateMobile == null){
                Meteor.call('insertConsumer',data);  
                $('#addForm')[0].reset();
            }else{
                if(businessId != bid){
                    if (confirm('Duplicate Entry/Consumer already exists.')) {
                        Meteor.call('updateDuplicate',data);
                        $('#addForm')[0].reset();
                        alert('Information Added...');
                     }

                }else {
                    if (confirm('Duplicate Contact would you like to update the Information?')) {
                        Meteor.call('updateConsumers',data);
                        $('#addForm')[0].reset();
                        alert('Information Updated...');
                    }     
                }
            }
        }
        Session.set('mode','isAdd');
        $('.editConsumer').prop( "disabled", true );
        
        
        
    },
    'submit #editForm' : function(event){
        event.preventDefault();
        var fname = $('#fname').val();
        var lname = $('#lname').val();
        var company = $('#company').val();
        var mobile = $('#mobile-no').val();
        data = {
            fname: fname,
            lname: lname,
            country: Session.get('country'),
            language: 'EN',
            points: 0,
            coins: 0,
            mobile: mobile,
            company: company,
            count : Session.get('count')
        }
        
        Meteor.call('updateConsumers',data);
        
        Session.set('mode',null);
        $('.editConsumer').prop( "disabled", true );
        
        
        
    }
});

Template.search.helpers({
    'searchedConversation' : function(){
        conversations = Interactions.find({}).fetch();
        
        return conversations;
    },
    'searchedConsumer' : function(){
        return Consumers.find({'identity.businessId':Meteor.user().profile.businessId}).fetch(); // change "55a7c8aa3bc759fb2403bb53" ->Meteor.user().profile.businessId
    },
    'isOwner' : function(isOwner){
        if(isOwner == Meteor.user().profile.businessId){ // change "55a7c8aa3bc759fb2403bb53" ->Meteor.user().profile.businessId
            return true;   
        }else{
            return false;   
        }
    },
    'isChecked': function(){
        return Session.equals('isChecked','isChecked');   
    },
    'getInfo': function(){
        return Consumers.find({mobile_number: Session.get('consumer_no')});  
    },
    'getConsumers' : function(){
        businessId = Meteor.user().profile.businessId
        return Consumers.find({'identity.businessId': businessId});
    }
});


Template.editSearch.helpers({
    'getIdentity' : function(){
        businessId = Meteor.user().profile.businessId;
        var consumers = Consumers.findOne({mobile_number: Session.get('consumer_no')}).identity
        for(var i = 0; i <= consumers.length;i++){
            if(consumers[i].businessId === businessId){
                Session.set('count',i);
                return Consumers.findOne({mobile_number: Session.get('consumer_no')}).identity[i];
            }
        }
        
    }
});
