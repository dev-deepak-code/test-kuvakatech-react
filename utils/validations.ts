import { z } from "zod"

export const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country"),
  phoneNumber: z
    .string()
    .min(6, "Phone number must be at least 6 digits")
    .max(15, "Phone number must be at most 15 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
})

export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
})

export type PhoneFormData = z.infer<typeof phoneSchema>
export type OtpFormData = z.infer<typeof otpSchema>
