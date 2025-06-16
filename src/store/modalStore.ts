// src/store/modalStore.ts
import { create } from "zustand";

export type ModalType = "success" | "error" | "warning" | "info" | "input";

interface ModalState {
	// Common state
	isOpen: boolean;
	type: ModalType;
	title: string;
	message: string;
	onClose?: () => void;

	// Input-specific state
	inputValue: string;
	inputError: string | null;
	isSubmitting: boolean;
	inputLabel?: string;
	inputPlaceholder?: string;
	inputType?: "text" | "email" | "password" | "number";
	defaultValue?: string;
	validation?: (value: string) => string | null;
	onSubmit?: (value: string) => void | Promise<void>;
	submitLabel?: string;
	cancelLabel?: string;

	// Modal actions
	showModal: (
		type: ModalType,
		title: string,
		message: string,
		onClose?: () => void
	) => void;
	showSuccess: (title: string, message: string, onClose?: () => void) => void;
	showError: (title: string, message: string, onClose?: () => void) => void;
	showWarning: (title: string, message: string, onClose?: () => void) => void;
	showInfo: (title: string, message: string, onClose?: () => void) => void;
	showInput: (config: {
		title: string;
		message: string;
		inputLabel?: string;
		inputPlaceholder?: string;
		inputType?: "text" | "email" | "password" | "number";
		defaultValue?: string;
		validation?: (value: string) => string | null;
		onSubmit?: (value: string) => void | Promise<void>;
		submitLabel?: string;
		cancelLabel?: string;
		onClose?: () => void;
	}) => void;

	// Input actions
	setInputValue: (value: string) => void;
	setInputError: (error: string | null) => void;
	submitInput: () => Promise<void>;

	// Common actions
	closeModal: () => void;
	transitionTo: (
		type: Exclude<ModalType, "input">,
		title: string,
		message: string
	) => void;
}

export const useModalStore = create<ModalState>((set, get) => ({
	// Initial state
	isOpen: false,
	type: "info",
	title: "",
	message: "",
	onClose: undefined,

	// Input-specific initial state
	inputValue: "",
	inputError: null,
	isSubmitting: false,
	inputLabel: "",
	inputPlaceholder: "",
	inputType: "text",
	defaultValue: "",
	validation: undefined,
	onSubmit: undefined,
	submitLabel: "Submit",
	cancelLabel: "Cancel",

	// Display modal actions
	showModal: (type, title, message, onClose) => {
		set({
			isOpen: true,
			type,
			title,
			message,
			onClose,
			// Reset input-specific state
			inputValue: "",
			inputError: null,
			isSubmitting: false,
			validation: undefined,
			onSubmit: undefined,
		});
	},

	showSuccess: (title, message, onClose) => {
		get().showModal("success", title, message, onClose);
	},

	showError: (title, message, onClose) => {
		get().showModal("error", title, message, onClose);
	},

	showWarning: (title, message, onClose) => {
		get().showModal("warning", title, message, onClose);
	},

	showInfo: (title, message, onClose) => {
		get().showModal("info", title, message, onClose);
	},

	// Input modal action
	showInput: (config) => {
		set({
			isOpen: true,
			type: "input",
			title: config.title,
			message: config.message,
			onClose: config.onClose,
			inputLabel: config.inputLabel,
			inputPlaceholder: config.inputPlaceholder,
			inputType: config.inputType || "text",
			defaultValue: config.defaultValue || "",
			validation: config.validation,
			onSubmit: config.onSubmit,
			submitLabel: config.submitLabel || "Submit",
			cancelLabel: config.cancelLabel || "Cancel",
			inputValue: config.defaultValue || "",
			inputError: null,
			isSubmitting: false,
		});
	},

	// Input specific actions
	setInputValue: (value) => {
		set({ inputValue: value, inputError: null });
	},

	setInputError: (error) => {
		set({ inputError: error });
	},

	submitInput: async () => {
		const state = get();
		if (state.type !== "input") return;

		// Validate input
		if (state.validation) {
			const error = state.validation(state.inputValue);
			if (error) {
				set({ inputError: error });
				return;
			}
		}

		// Submit
		set({ isSubmitting: true, inputError: null });

		try {
			if (state.onSubmit) {
				await state.onSubmit(state.inputValue);
			}
			// Don't close here - let the onSubmit handler decide what to do
		} catch (error) {
			set({
				inputError:
					error instanceof Error ? error.message : "An error occurred",
				isSubmitting: false,
			});
		}
	},

	// Transition from input to success/error
	transitionTo: (type, title, message) => {
		set({
			type,
			title,
			message,
			isSubmitting: false,
			inputValue: "",
			inputError: null,
		});
	},

	closeModal: () => {
		const { onClose } = get();
		if (onClose) {
			onClose();
		}

		set({
			isOpen: false,
			title: "",
			message: "",
			onClose: undefined,
			inputValue: "",
			inputError: null,
			isSubmitting: false,
			validation: undefined,
			onSubmit: undefined,
		});
	},
}));
