// 

// TODO: make credentials.js get the needed information for emailing, fix promise being treated as value error, change tests

import * as nodemailer from "nodemailer";

export let name = "Send email";

export let inputs = {
	"message": "string",
	"recipient_email": "string"
}

export let outputs = [];

export let requires = {
	sender_email: "string",
	sender_password: "string",
	service: "string "
};


export let run = (requires: any, input : any): Promise<void> => {
	return new Promise<void> ((resolve, reject) => {
		let transporter = nodemailer.createTransport({
			service: requires.service,
			port: 465, 
			secure: true,
			auth: {
				user: requires.sender_email,
				pass: requires.sender_password,
			}
		});
		let mailOptions = {
			from: requires.sender_email,
			to: input.recipient_email,
			subject: "test",
			text: input.message
		};
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
