var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var InvoiceSchema = mongoose.Schema({
	ContractAddress: {
		type: String,		
	},
	firstName: {
		type: String
	},
	SSN: {
		type: String
	},
	phoneNumber: {
		type: String
	},
	email:{
		type: String
	},
	specialty1:{
		type: String
	},
	address1:{
		type: String
	},
	currentStatus:{
		type: String
	}
});
	
var Invoice = module.exports = mongoose.model('if', InvoiceSchema);


module.exports.createMessage = function(newInvoice, callback){

	        newInvoice.save(callback);	
}

