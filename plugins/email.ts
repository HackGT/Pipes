// 

// TODO: make credentials.js get the needed information for emailing, fix promise being treated as value error, change tests

var nodemailer = require("nodemailer");
var credentials = require("./credentials.ts")

export let transporter = nodemailer.createTransport({
	service: credentials.service,
	port: 465, 
	secure: true,
	auth: {
		user: credentials.username,
		pass: credentials.password,
	}
});

export let mailOptions = {
	from: credentials.username,
	to: credentials.recipient,
	subject: "test",
	text: "sent from node"
};

export let name = "Send email";

export let inputs = [
	"text",
]

export let outputs = [];

export let requires = {
	sender_email: "text",
	sender_password: "text",
	recipient_email: "text",
};

export let run = (requires: any): Promise<void> => {
	return new Promise<void> ((resolve, reject) => {
		transporter.sendMail(mailOptions, function(error, info) {
		    if (error) {
		        reject(error);
		    } else {
		        console.log("Email sent: " + info.response);
		        resolve();
		    }
		});	
	});
};