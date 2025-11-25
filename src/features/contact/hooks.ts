import { useMutation } from "@tanstack/react-query";
import { sendContactAction } from "@/actions/contact";
import type { ContactInput } from "@/schemas";

export function useSendContact() {
  return useMutation({
    mutationFn: async (data: ContactInput) => {
      return sendContactAction(data);
    },
  });
}
