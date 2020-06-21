import * as sgMail from '@sendgrid/mail';
import { Message } from '../interfaces/msg.interface';

export default async function sendEmail(msg: Message) {    
    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
    }
}