"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { signIn, signOut } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { registerSchema, loginSchema } from "@/features/auth/validators/auth-schema";
import { AuthError } from "next-auth";

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Server Action: Register a new user.
 * Validates input, checks for existing email, hashes password, and creates user.
 */
export async function registerUser(
  formData: FormData
): Promise<AuthActionResult> {
  try {
    const rawData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    // Validate input
    const parsed = registerSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return { success: false, error: firstError.message };
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    if (existingUser) {
      return { success: false, error: "An account with this email already exists" };
    }

    // Hash password (12 rounds for production-grade security)
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    await db.insert(users).values({
      name,
      email: normalizedEmail,
      passwordHash,
    });

    // Auto sign-in after registration
    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { success: false, error: "Something went wrong. Please try again." };
  }
}

/**
 * Server Action: Sign in with credentials.
 */
export async function loginUser(
  formData: FormData
): Promise<AuthActionResult> {
  try {
    const rawData = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    // Validate input
    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return { success: false, error: firstError.message };
    }

    await signIn("credentials", {
      email: rawData.email.toLowerCase(),
      password: rawData.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return { success: false, error: "Something went wrong. Please try again." };
      }
    }
    throw error; // Re-throw non-auth errors (e.g., redirect)
  }
}

/**
 * Server Action: Sign out.
 */
export async function logoutUser(): Promise<void> {
  await signOut({ redirect: false });
}
