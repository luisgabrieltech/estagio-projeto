import { prisma } from '@/lib/services/prisma'
import type { User } from '@/types/entities/user'
import type { PaginatedResponse } from '@/types/common/pagination'
import type {
  IUserRepository,
  UserEntity,
  CreateUserData,
} from '@/lib/domain/user/user.repository'
import type { UpdateUserDTO, UserFiltersDTO } from '@/lib/domain/user/user.schema'

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  functionalRoles: true,
  extraData: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const

const userWithPasswordSelect = {
  ...userSelect,
  password: true,
} as const

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userWithPasswordSelect,
    })
    return user as UserEntity | null
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: userWithPasswordSelect,
    })
    return user as UserEntity | null
  }

  async findMany(filters: UserFiltersDTO): Promise<PaginatedResponse<User>> {
    const { search, role, functionalRole, active, page = 1, pageSize = 10 } = filters

    const where = this.buildWhereClause({ search, role, functionalRole, active })

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return {
      data: users as User[],
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  }

  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: data.password,
        role: data.role,
        functionalRoles: data.functionalRoles,
        extraData: data.extraData,
      },
      select: userSelect,
    })
    return user as User
  }

  async update(id: string, data: UpdateUserDTO): Promise<User> {
    const updateData: Record<string, unknown> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email.toLowerCase()
    if (data.role !== undefined) updateData.role = data.role
    if (data.functionalRoles !== undefined) updateData.functionalRoles = data.functionalRoles
    if (data.extraData !== undefined) updateData.extraData = data.extraData
    if (data.active !== undefined) updateData.active = data.active

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelect,
    })
    return user as User
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    })
  }

  async count(filters?: Partial<UserFiltersDTO>): Promise<number> {
    const where = filters ? this.buildWhereClause(filters) : {}
    return prisma.user.count({ where })
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    })
  }

  async setResetToken(email: string, token: string, expiry: Date): Promise<void> {
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: {
        resetToken: token,
        resetTokenExp: expiry,
      },
    })
  }

  async findByResetToken(token: string): Promise<UserEntity | null> {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: { gt: new Date() },
      },
      select: userWithPasswordSelect,
    })
    return user as UserEntity | null
  }

  async resetPassword(id: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExp: null,
      },
    })
  }

  private buildWhereClause(filters: Partial<UserFiltersDTO>) {
    const where: Record<string, unknown> = {}

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    if (filters.role) {
      where.role = filters.role
    }

    if (filters.functionalRole) {
      where.functionalRoles = { has: filters.functionalRole }
    }

    if (filters.active !== undefined) {
      where.active = filters.active
    }

    return where
  }
}

export const prismaUserRepository = new PrismaUserRepository()
