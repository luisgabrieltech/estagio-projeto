import type { User } from '@/types/entities/user'
import type { PaginatedResponse } from '@/types/common/pagination'
import type { CreateUserDTO, UpdateUserDTO, UserFiltersDTO } from './user.schema'

/**
 * User entity as stored in the database (includes password hash)
 */
export interface UserEntity extends User {
  password: string
}

/**
 * Data required to create a user in the repository
 * Password should already be hashed at this point
 */
export interface CreateUserData extends Omit<CreateUserDTO, 'password'> {
  password: string // Hashed password
}

/**
 * Interface for User repository operations
 * Abstracts data access layer from business logic
 */
export interface IUserRepository {
  /**
   * Find a user by their unique ID
   * @param id - User's unique identifier
   * @returns User entity or null if not found
   */
  findById(id: string): Promise<UserEntity | null>

  /**
   * Find a user by their email address
   * @param email - User's email address
   * @returns User entity or null if not found
   */
  findByEmail(email: string): Promise<UserEntity | null>

  /**
   * Find multiple users with filtering and pagination
   * @param filters - Filter and pagination options
   * @returns Paginated list of users (without password)
   */
  findMany(filters: UserFiltersDTO): Promise<PaginatedResponse<User>>

  /**
   * Create a new user
   * @param data - User creation data with hashed password
   * @returns Created user (without password)
   */
  create(data: CreateUserData): Promise<User>

  /**
   * Update an existing user
   * @param id - User's unique identifier
   * @param data - Fields to update
   * @returns Updated user (without password)
   */
  update(id: string, data: UpdateUserDTO): Promise<User>

  /**
   * Delete a user by ID
   * @param id - User's unique identifier
   */
  delete(id: string): Promise<void>

  /**
   * Count users matching optional filters
   * @param filters - Optional filter criteria
   * @returns Number of matching users
   */
  count(filters?: Partial<UserFiltersDTO>): Promise<number>

  /**
   * Update user password
   * @param id - User's unique identifier
   * @param hashedPassword - New hashed password
   */
  updatePassword(id: string, hashedPassword: string): Promise<void>

  /**
   * Set password reset token for a user
   * @param email - User's email address
   * @param token - Reset token
   * @param expiry - Token expiry date
   */
  setResetToken(email: string, token: string, expiry: Date): Promise<void>

  /**
   * Find user by reset token
   * @param token - Reset token
   * @returns User entity or null if not found or token expired
   */
  findByResetToken(token: string): Promise<UserEntity | null>

  /**
   * Reset password and clear reset token
   * @param id - User's unique identifier
   * @param hashedPassword - New hashed password
   */
  resetPassword(id: string, hashedPassword: string): Promise<void>
}
