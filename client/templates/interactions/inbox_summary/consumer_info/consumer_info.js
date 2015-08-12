Template.consumerInfo.helpers({
    consumer: function () {
        var consumer = Consumers.findOne({mobile_number: Session.get('currentConsumerInfo').number});
        if(consumer) {
            var identity = consumer.identity;
            for(var x = 0; x < identity.length; x++) {
                if(identity[x].businessId == Meteor.user().profile.businessId) consumer.identity = identity[x];
            }
            consumer.others = {};
            var others = consumer.identity.others;
            if(others) {
                var half = Math.round(others.length / 2);
                consumer.others.col1 = others.splice(0, half);
                consumer.others.col2 = others;
            }
            return consumer;   
        } else return {others: {}};
    },
});