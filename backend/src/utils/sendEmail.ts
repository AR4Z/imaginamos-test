import * as sgMail from '@sendgrid/mail';
import Message from '../interfaces/msg.interface';

export default async function sendEmail(msg: Message) {
    sgMail.setApiKey('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');
    
    try {
        await sgMail.send(msg);
    } catch (error) {
        console.error(error);
        if (error.response) {
            console.error(error.response.body)
        }
    }
}