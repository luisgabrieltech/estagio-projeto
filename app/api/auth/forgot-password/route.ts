import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { handleDomainError, ValidationError } from '@/lib/domain/errors'
import { UserService } from '@/lib/domain/user'
import { prismaUserRepository } from '@/lib/infrastructure'
import { sendEmail } from '@/lib/services/email'
import { brand } from '@/lib/config/brand'

const userService = new UserService(prismaUserRepository)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.trim()) {
      throw new ValidationError('E-mail é obrigatório')
    }

    // Por segurança, sempre retornamos sucesso mesmo se o email não existir
    // Isso evita que atacantes descubram quais emails estão cadastrados
    try {
      const { token, user } = await userService.generateResetToken(email)

      const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${token}`

      await sendEmail({
        to: email,
        subject: `Recuperação de senha · ${brand.name}`,
        html: `
          <h1>Recuperação de senha</h1>
          <p>Olá ${user.name},</p>
          <p>Você solicitou a recuperação de senha. Clique no link abaixo para redefinir sua senha:</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>Este link expira em 1 hora.</p>
          <p>Se você não solicitou a recuperação de senha, ignore este e-mail.</p>
        `,
      })
    } catch {
      // Silenciosamente ignora erros de usuário não encontrado
      // para não revelar se o email está cadastrado
    }

    return success({ 
      message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação' 
    })
  } catch (error) {
    return handleDomainError(error)
  }
}
