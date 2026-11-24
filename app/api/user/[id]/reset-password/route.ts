import { NextRequest } from 'next/server'
import { success } from '@/lib/api/server-helpers'
import { requireAdmin } from '@/lib/api/auth'
import { handleDomainError, ValidationError } from '@/lib/domain/errors'
import { UserService } from '@/lib/domain/user'
import { prismaUserRepository } from '@/lib/infrastructure'
import { sendEmail } from '@/lib/services/email'

const userService = new UserService(prismaUserRepository)

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    
    const { id } = await params
    if (!id) {
      throw new ValidationError('ID do usuário é obrigatório')
    }

    const user = await userService.getUserById(id)
    const { token } = await userService.generateResetToken(user.email)

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password/${token}`
    
    await sendEmail({
      to: user.email,
      subject: 'Redefinição de senha',
      html: `<p>Olá, ${user.name}!<br>Você solicitou a redefinição de senha.<br><a href='${resetUrl}'>Clique aqui para redefinir sua senha</a>.<br>Se não foi você, ignore este e-mail.</p>`
    })

    return success({ message: 'E-mail de redefinição enviado com sucesso' })
  } catch (error) {
    return handleDomainError(error)
  }
}
