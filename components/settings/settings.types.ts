export interface UserProfileData {
  name: string
  email: string
  functionalRoles?: string[]
  extraData?: UserExtraData
}

export interface UserExtraData {
  course?: string
  campus?: string
  registration?: string
  phone?: string
  avatar?: string
}

export interface UserDataState {
  name: string
  email: string
  functionalRoles: string[]
  extraData: {
    course: string
    campus: string
    registration: string
    phone: string
    avatar?: string
  }
}

export interface PasswordErrors {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export interface ProfileTabProps {
  userData: UserDataState
  setUserData: (data: UserDataState) => void
  isEditing: boolean
  setIsEditing: (editing: boolean) => void
  isLoading: boolean
  saveSuccess: boolean
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
  isUploadingAvatar: boolean
  setIsUploadingAvatar: (uploading: boolean) => void
  phoneError: string
  setPhoneError: (error: string) => void
  onSave: (e: React.FormEvent) => Promise<void>
}

export interface SecurityTabProps {
  onPasswordChange: (e: React.FormEvent) => Promise<void>
  isChangingPassword: boolean
  errors: PasswordErrors
  setErrors: (errors: PasswordErrors) => void
  success: boolean
  setSuccess: (success: boolean) => void
  currentPassword: string
  setCurrentPassword: (password: string) => void
  newPassword: string
  setNewPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
}
