"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const mailgun_js_1 = __importDefault(require("mailgun-js"));
const DOMAIN = process.env.MAILGUN_DOMAIN;
const API_KEY = process.env.MAILGUN_API_KEY;
const NODE_ENV = process.env.NODE_ENV;
const sendEmail = async (data) => {
    if (!DOMAIN || !API_KEY) {
        console.log(`Missing Mailgun Config:
Add a MAILGUN_DOMAIN, MAILGUN_API_KEY, and DEV_EMAIL to start testing the email integration
    `);
        return;
    }
    if (NODE_ENV === 'test') {
        // console.log(`Skip emails in tests`);
        return;
    }
    const mg = mailgun_js_1.default({ apiKey: API_KEY, domain: DOMAIN });
    const payload = {
        ...data,
        from: 'Teddy <notifications@callteddy.com>',
    };
    if (process.env.DEV_EMAIL) {
        console.log(`Overriding with DEV_EMAIL: ${process.env.DEV_EMAIL}`);
        payload.to = process.env.DEV_EMAIL;
        payload.subject = `DEV: ${payload.subject}`;
        payload.text = `Originally sent to ${data.to}...\n\n ${data.text}`;
        payload.html = `Originally sent to ${data.to}...\n\n ${data.html}`;
    }
    return new Promise((resolve, reject) => {
        mg.messages().send(payload, (err, body) => {
            if (err) {
                return reject(err);
            }
            return resolve(body);
        });
    });
};
exports.sendEmail = sendEmail;
