// src/hooks/useInputModal.ts
import { useModalStore } from "@/store/modalStore";
import { useCallback } from "react";

interface InputModalOptions {
	title: string;
	message: string;
	inputLabel?: string;
	inputPlaceholder?: string;
	inputType?: "text" | "email" | "password" | "number";
	defaultValue?: string;
	validation?: (value: string) => string | null;
	submitLabel?: string;
	cancelLabel?: string;
}

export function useInputModal() {
	const { showInput, transitionTo } = useModalStore();

	/**
	 * Show an input modal and handle the response
	 * Returns a promise that resolves with the input value or null if cancelled
	 */
	const getInput = useCallback(
		(options: InputModalOptions): Promise<string | null> => {
			return new Promise((resolve) => {
				showInput({
					...options,
					onSubmit: async (value) => {
						// Transition to success state
						transitionTo("success", "Success!", "Your input has been saved.");
						resolve(value);
					},
					onClose: () => {
						resolve(null);
					},
				});
			});
		},
		[showInput, transitionTo]
	);

	/**
	 * Show an input modal with async validation/submission
	 */
	const getInputWithAsyncHandler = useCallback(
		(options: InputModalOptions, handler: (value: string) => Promise<void>) => {
			showInput({
				...options,
				onSubmit: async (value) => {
					try {
						await handler(value);
						// Transition to success
						transitionTo(
							"success",
							"Success!",
							"Operation completed successfully."
						);
					} catch (error) {
						// Transition to error
						transitionTo(
							"error",
							"Operation Failed",
							error instanceof Error
								? error.message
								: "An unexpected error occurred"
						);
					}
				},
			});
		},
		[showInput, transitionTo]
	);

	return {
		getInput,
		getInputWithAsyncHandler,
	};
}

// Example usage of useInputModal in a component
/*
import { useInputModal } from '@/hooks/useInputModal';

export function GroupSettings() {
  const { getInputWithAsyncHandler } = useInputModal();
  
  const handleRenameGroup = () => {
    getInputWithAsyncHandler(
      {
        title: 'Rename Group',
        message: 'Enter a new name for this group',
        inputLabel: 'Group Name',
        inputPlaceholder: 'Enter group name...',
        validation: (value) => {
          if (!value.trim()) return 'Group name is required';
          if (value.length < 3) return 'Group name must be at least 3 characters';
          if (value.length > 50) return 'Group name must be less than 50 characters';
          return null;
        },
        submitLabel: 'Rename',
      },
      async (newName) => {
        // API call to rename group
        const response = await fetch(`/api/groups/${groupId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to rename group');
        }
        
        // The modal will automatically transition to success state
      }
    );
  };
  
  return (
    <button onClick={handleRenameGroup} className="btn-primary">
      Rename Group
    </button>
  );
}
*/
