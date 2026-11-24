import { hash, compare } from 'bcryptjs'
import { randomBytes } from 'crypto'
import type { User } from '@/types/entities/user'
import type { PaginatedResponse } from '@/types/common/pagination'
import type { IUserRepository } from './user.repository'
import {
  createUserSchema,
  updateUserSchema,
  userFiltersSchema,
  type CreateUserDTO,
  type UpdateUserDTO,
  type UserFiltersDTO,
} from './user.schema'
import {
  ConflictError,
  NotFoundError,
  ValidationError,
  formatZodErrors,
} from '@/lib/domain/errors'
import { isStrongPassword, getPasswordErrors } from '@/lib/utils/validation-utils'

export class UserService {
  constructor(private readonly userRepository: IUserRepository) {}

  async createUser(data: CreateUserDTO): Promise<User> {
    const parseResult = createUserSchema.safeParse(data)
    if (!parseResult.success) {
      const details = formatZodErrors(parseResult.error.errors)
      throw new ValidationError('Dados de usuário inválidos', details)
    }
    const validated = parseResult.data

    const existingUser = await this.userRepository.findByEmail(validated.email)
    if (existingUser) {
      throw new ConflictError('Email já cadastrado')
    }

    const hashedPassword = await hash(validated.password, 12)

    return this.userRepository.create({
      ...validated,
      password: hashedPassword,
    })
  }

  async updateUser(id: string, data: UpdateUserDTO): Promise<User> {
    const parseResult = updateUserSchema.safeParse(data)
    if (!parseResult.success) {
      const details = formatZodErrors(parseResult.error.errors)
      throw new ValidationError('Dados de atualização inválidos', details)
    }
    const validated = parseResult.data

    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new NotFoundError('Usuário', id)
    }

    if (validated.email && validated.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(validated.email)
      if (userWithEmail) {
        throw new ConflictError('Email já cadastrado')
      }
    }

    return this.userRepository.update(id, validated)
  }

  async deleteUser(id: string): Promise<void> {
    const existingUser = await this.userRepository.findById(id)
    if (!existingUser) {
      throw new NotFoundError('Usuário', id)
    }

    await this.userRepository.delete(id)
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id)
    if (!user) {
      throw new NotFoundError('Usuário', id)
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  }

  async getUsers(filters: UserFiltersDTO): Promise<PaginatedResponse<User>> {
    const parseResult = userFiltersSchema.safeParse(filters)
    if (!parseResult.success) {
      const details = formatZodErrors(parseResult.error.errors)
      throw new ValidationError('Filtros inválidos', details)
    }
    const validated = parseResult.data

    return this.userRepository.findMany(validated)
  }

  async getProfileByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundError('Usuário', email)
    }

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword as User
  }

  async updateProfileByEmail(
    email: string,
    data: { name?: string; extraData?: Record<string, unknown> }
  ): Promise<User> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundError('Usuário', email)
    }

    if (data.extraData === undefined) {
      return this.userRepository.update(user.id, data)
    }

    if (!data.extraData || typeof data.extraData !== 'object' || Array.isArray(data.extraData)) {
      throw new ValidationError('Dados adicionais de perfil inválidos')
    }

    const extraData = { ...data.extraData }
    delete extraData.functionalRoles
    if (user.extraData?.functionalRoles !== undefined) {
      extraData.functionalRoles = user.extraData.functionalRoles
    }

    return this.userRepository.update(user.id, { ...data, extraData })
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    if (!isStrongPassword(newPassword)) {
      const errors = getPasswordErrors(newPassword)
      throw new ValidationError('A nova senha não atende aos requisitos de segurança', {
        password: errors
      })
    }

    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new NotFoundError('Usuário', userId)
    }

    const isPasswordValid = await compare(currentPassword, user.password)
    if (!isPasswordValid) {
      throw new ValidationError('Senha atual incorreta')
    }

    const hashedPassword = await hash(newPassword, 12)
    await this.userRepository.updatePassword(userId, hashedPassword)
  }

  async registerUser(data: {
    name: string
    email: string
    password: string
    functionalRoles: string[]
  }): Promise<User> {
    if (!data.name || !data.email || !data.password) {
      throw new ValidationError('Todos os campos são obrigatórios')
    }

    if (!data.functionalRoles || data.functionalRoles.length === 0) {
      throw new ValidationError('Pelo menos um cargo funcional deve ser selecionado')
    }

    if (!isStrongPassword(data.password)) {
      const errors = getPasswordErrors(data.password)
      throw new ValidationError('A senha não atende aos requisitos de segurança', {
        password: errors
      })
    }

    const existingUser = await this.userRepository.findByEmail(data.email)
    if (existingUser) {
      throw new ConflictError('Este e-mail já está em uso')
    }

    const hashedPassword = await hash(data.password, 12)

    return this.userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: 'USER',
      functionalRoles: [],
      extraData: { functionalRoles: data.functionalRoles },
    })
  }

  async generateResetToken(email: string): Promise<{ token: string; user: { name: string; email: string } }> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) {
      throw new NotFoundError('Usuário', email)
    }

    const token = randomBytes(32).toString('hex')
    const expiry = new Date(Date.now() + 3600000)

    await this.userRepository.setResetToken(email, token, expiry)

    return {
      token,
      user: { name: user.name, email: user.email },
    }
  }

  async resetPasswordWithToken(token: string, newPassword: string): Promise<void> {
    if (!isStrongPassword(newPassword)) {
      const errors = getPasswordErrors(newPassword)
      throw new ValidationError('A senha não atende aos requisitos de segurança', {
        password: errors
      })
    }

    const user = await this.userRepository.findByResetToken(token)
    if (!user) {
      throw new ValidationError('Token inválido ou expirado')
    }

    const hashedPassword = await hash(newPassword, 12)
    await this.userRepository.resetPassword(user.id, hashedPassword)
  }
}
