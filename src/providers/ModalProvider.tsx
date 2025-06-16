// src/components/providers/ModalProvider.tsx
"use client";

import { Modal } from "@/components/Modal";

export function ModalProvider({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<>
			{children}
			<Modal />
		</>
	);
}
