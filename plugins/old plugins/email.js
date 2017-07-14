"use strict";
// 
Object.defineProperty(exports, "__esModule", { value: true });
// TODO: make credentials.js get the needed information for emailing, fix promise being treated as value error, change tests
const nodemailer = require("nodemailer");
exports.name = "Send email";
exports.inputs = {
    "message": "string",
    "recipient_email": "string"
};
exports.outputs = [];
exports.requires = {
    sender_email: "string",
    sender_password: "string",
    service: "string "
};
exports.run = (requires, input) => {
    return new Promise((resolve, reject) => {
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
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
            }
            else {
                console.log("Email sent: " + info.response);
                resolve();
            }
        });
    });
};
//# sourceMappingURL=email.js.map