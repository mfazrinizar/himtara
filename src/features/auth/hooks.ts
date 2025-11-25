import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginAction, registerAction, forgotPasswordAction, logoutAction } from "@/actions/auth";
import type { LoginInput, RegisterInput, ForgotPasswordInput } from "@/schemas";

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
