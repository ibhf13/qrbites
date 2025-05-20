import { z } from 'zod'

export const passwordValidation = {
  minLength: (password: string) => password.length >= 8,
  hasUppercase: (password: string) => /[A-Z]/.test(password),
  hasLowercase: (password: string) => /[a-z]/.test(password),
  hasNumber: (password: string) => /[0-9]/.test(password),
  isValid: (password: string) => {
    return passwordValidation.minLength(password) &&
           passwordValidation.hasUppercase(password) &&
           passwordValidation.hasLowercase(password) &&
           passwordValidation.hasNumber(password)
  }
}

export const hasPasswordFields = (data: { currentPassword?: string; newPassword?: string; confirmNewPassword?: string }) => {
  return Boolean(data.currentPassword || data.newPassword || data.confirmNewPassword)
}

export const basicInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required')
})

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine(passwordValidation.hasUppercase, 'Password must contain at least one uppercase letter')
    .refine(passwordValidation.hasLowercase, 'Password must contain at least one lowercase letter')
    .refine(passwordValidation.hasNumber, 'Password must contain at least one number'),
  confirmNewPassword: z.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ['confirmNewPassword']
})

export const profileFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmNewPassword: z.string().optional()
}).superRefine((data, ctx) => {
  const hasPasswordData = hasPasswordFields(data)
  
  if (!hasPasswordData) {
    return
  }

  if (!data.currentPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Current password is required',
      path: ['currentPassword']
    })
  }

  if (!data.newPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'New password is required',
      path: ['newPassword']
    })
  } else {
    if (!passwordValidation.minLength(data.newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must be at least 8 characters',
        path: ['newPassword']
      })
    }
    
    if (!passwordValidation.hasUppercase(data.newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one uppercase letter',
        path: ['newPassword']
      })
    }
    
    if (!passwordValidation.hasLowercase(data.newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one lowercase letter',
        path: ['newPassword']
      })
    }
    
    if (!passwordValidation.hasNumber(data.newPassword)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must contain at least one number',
        path: ['newPassword']
      })
    }
  }
  
  if (!data.confirmNewPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please confirm your new password',
      path: ['confirmNewPassword']
    })
  } else if (data.newPassword !== data.confirmNewPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ['confirmNewPassword']
    })
  }
})

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>
export type PasswordChangeFormData = z.infer<typeof passwordChangeSchema>
export type ProfileFormData = z.infer<typeof profileFormSchema> 