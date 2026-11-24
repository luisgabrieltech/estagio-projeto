import nodemailer from "nodemailer"
import { createLogger } from "@/lib/core"
import { config } from "@/lib/config"

const emailLogger = createLogger({ module: 'email' })

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.port === 465,
  auth: {
    user: config.email.user,
    pass: config.email.password,
  },
})

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    })
    emailLogger.info("E-mail enviado com sucesso", { to, subject })
  } catch (error) {
    emailLogger.error("Erro ao enviar e-mail", error instanceof Error ? error : undefined, { to, subject })
    throw new Error("Erro ao enviar e-mail")
  }
} 
