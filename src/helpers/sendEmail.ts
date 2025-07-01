import sendMailer from "../lib/mailer";

//funcion para enviando de link
export async function sendMailerVerificationLink(email: string, link: string) {

	try {
		await sendMailer({
			to: email,
			subject: 'Verificación de Email',
			html: `
			<!DOCTYPE html>
			<html lang="es">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; color: #333; background-color: #f4f4f4;">
				<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
					<p>Hola,</p>
					<p>Para verificar su email ${email}, por favor, haz clic en el siguiente botón:</p>
					<a href="${link}" style="display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 16px; color: #ffffff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verificar Email</a>
					<p>O copia y pega el siguiente enlace en tu navegador:</p>
					<p style="color: #007bff; word-break: break-all;">${link}</p>
					<p>Gracias por tu colaboración.</p>
					<p>Saludos cordiales,<br><strong>Gextix pro</strong></p>
				</div>
			</body>
			</html>
    `
		})
		return true;
	} catch (error) { }
}

//funcion para enviando codigo
export async function sendMailerVerificationCode(email: string, code: string) {

	try {
		await sendMailer({
			to: email,
			subject: 'Código de Verificación',
			html: `
			<!DOCTYPE html>
			<html lang="es">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
			</head>
			<body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; color: #333; background-color: #f4f4f4;">
				<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
					<p>Hola,</p>
					<p>Para verificar su cuenta, por favor ingresa el siguiente código:</p>
					<p style="font-size: 20px; font-weight: bold;">${code}</p>
					<p>Gracias por tu colaboración.</p>
					<p>Saludos cordiales,<br><strong>Gextix pro</strong></p>
				</div>
			</body>
			</html>
    	`})
		return true;
	} catch (error) { }
}


//funcion de notificacion al correo por movimientos
export async function notificationMailerFunction(email: string, name: string) {
	try {
		const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

		await sendMailer({
			to: email,
			subject: 'inicio de sesion ',
			text: `Hola ${name
				} \nesta noficacion por correo es por verificacion de codigo exitoso con fecha: ${formattedDate}`,
			html: `\nGextix tu mejor solucion para organizar tus proyectos y reuniones con todo tu grupo con limite de acceso\n
            a archivos y carpetas todo y cuando lo desees, somo gextix para tu vida, tu vida es mejor con\n <b>Gextix.com</b>`,
		})
	} catch (error) { }
}

export function generateCodeRamdon() {
	return Math.floor(10000 + Math.random() * 90000).toString()

}
