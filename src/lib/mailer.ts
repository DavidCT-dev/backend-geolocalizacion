import nodemailer from 'nodemailer';


export interface EmailParams {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}
// nombre app google=geolocalizacion
// contraeña de app=ldje bcrd kntp kgjx
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'Cooperativa12mayo@gmail.com',
        pass: 'ldje bcrd kntp kgjx'
    }
})

//enviando correo
const sendMailer = async ({ to, subject, text, html }: EmailParams) => {
    try {
        await transporter.sendMail({
            from: 'Coop. : < Cooperativa12mayo@gmail.com >',
            to,
            subject,
            html,
            text,
        })
        return { ok: true, message: "email enviado" }
    } catch (error) {
        console.log({ error })
        return { ok: false, message: "problem to send mail" }
    }
}

export default sendMailer

