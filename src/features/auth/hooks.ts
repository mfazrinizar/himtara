import { useMutation, useQueryClient } from "@tanstack/react-query";
import { loginAction, registerAction, forgotPasswordAction, logoutAction } from "@/actions/auth";
import { auth } from "@/lib/firebase/client";
import type { LoginInput, RegisterInput, ForgotPasswordInput } from "@/schemas";

/**
 * Refresh tokens with rotation - gets a fresh Firebase ID token
 * and sends it to the server to rotate the refresh token
 */
export async function refreshTokensWithRotation(): Promise<boolean> {
  try {
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      // Get a fresh Firebase ID token (force refresh)
      const newIdToken = await currentUser.getIdToken(true);
      
      // Send to server for rotation
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newRefreshToken: newIdToken }),
        credentials: "include",
      });
      
      return response.ok;
    }
    
    // No Firebase user, try refresh without rotation
    const response = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });
    
    return response.ok;
  } catch (error) {
    console.error("Token refresh with rotation failed:", error);
    return false;
  }
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: LoginInput) => loginAction(data),
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterInput) => registerAction(data),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordInput) => forgotPasswordAction(data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logoutAction(),
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
