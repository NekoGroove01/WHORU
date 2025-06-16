"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import {
	RiSparklingFill,
	RiQuestionFill,
	RiChatQuoteFill,
	RiSearchEyeFill,
	RiCloseFill,
	RiSendPlaneFill,
	RiArrowLeftFill,
	RiCheckLine,
	RiFileCopyLine,
} from "react-icons/ri";
import { aiService, type SimilarQuestion } from "@/utils/aiService";

type AIModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onSelect?: (content: string) => void;
	precontent?: string;
	groupId?: string;
	questionId?: string;
};

type AIFunction = "generate-question" | "generate-answer" | "similar-question";

interface AIFunctionConfig {
	id: AIFunction;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	placeholder: string;
	buttonText: string;
}

// Helper function to parse numbered responses
const parseNumberedResponses = (text: string): string[] => {
	// Match patterns like "1. ", "2. ", "3. " at the beginning of lines
	const regex = /^\d+\.\s+(.+?)(?=\n\d+\.|$)/gm;
	const matches = [];
	let match;

	// Extract all numbered items
	while ((match = regex.exec(text)) !== null) {
		matches.push(match[1].trim());
	}

	// If no numbered format found, try to split by line breaks
	if (matches.length === 0) {
		const lines = text.split("\n").filter((line) => line.trim());
		return lines.slice(0, 3);
	}

	// Return only first 3 responses
	return matches.slice(0, 3);
};

// Response Card Component
const ResponseCard = ({
	response,
	index,
	onSelect,
}: {
	response: string;
	index: number;
	onSelect: (response: string) => void;
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = async (e: React.MouseEvent) => {
		e.stopPropagation();
		await navigator.clipboard.writeText(response);
		setIsCopied(true);
		setTimeout(() => setIsCopied(false), 2000);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.1 }}
			whileHover={{ scale: 1.02, y: -2 }}
			onHoverStart={() => setIsHovered(true)}
			onHoverEnd={() => setIsHovered(false)}
			onClick={() => onSelect(response)}
			className="relative cursor-pointer"
		>
			<div
				className={`
				p-4 rounded-xl border transition-all duration-200
				${
					isHovered
						? "border-primary/50 bg-primary/5 dark:bg-primary/10 shadow-lg"
						: "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50"
				}
			`}
			>
				<div className="flex items-start gap-3">
					<motion.div
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: index * 0.1 + 0.2 }}
						className={`
							flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
							${
								isHovered
									? "bg-primary text-white"
									: "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
							}
							transition-all duration-200
						`}
					>
						<span className="font-semibold text-sm">{index + 1}</span>
					</motion.div>

					<div className="flex-1">
						<p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
							{response}
						</p>
					</div>

					<motion.button
						onClick={handleCopy}
						className={`
							p-2 rounded-lg transition-all duration-200
							${
								isCopied
									? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
									: "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
							}
						`}
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
					>
						{isCopied ? (
							<RiCheckLine className="text-sm" />
						) : (
							<RiFileCopyLine className="text-sm" />
						)}
					</motion.button>
				</div>

				{isHovered && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md whitespace-nowrap z-10"
					>
						Click to use this response
						<div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
					</motion.div>
				)}
			</div>
		</motion.div>
	);
};

// Constants
const AI_FUNCTIONS: AIFunctionConfig[] = [
	{
		id: "generate-question",
		title: "Generate Question",
		description: "AI will create thoughtful questions based on your topic",
		icon: RiQuestionFill,
		color: "from-blue-500 to-blue-600",
		placeholder: "Enter a topic or context for question generation...",
		buttonText: "Generate Questions",
	},
	{
		id: "generate-answer",
		title: "Generate Answer",
		description: "AI will provide detailed answers to your questions",
		icon: RiChatQuoteFill,
		color: "from-purple-500 to-purple-600",
		placeholder: "Enter your question for AI to answer...",
		buttonText: "Generate Answer",
	},
	{
		id: "similar-question",
		title: "Find Similar Questions",
		description: "AI will find questions similar to yours",
		icon: RiSearchEyeFill,
		color: "from-pink-500 to-pink-600",
		placeholder: "Enter a question to find similar ones...",
		buttonText: "Find Similar",
	},
];

// Helper Components
const FunctionCard = ({
	func,
	onSelect,
}: {
	func: AIFunctionConfig;
	onSelect: (id: AIFunction) => void;
}) => {
	const IconComponent = func.icon;

	return (
		<motion.button
			onClick={() => onSelect(func.id)}
			className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-200 text-left group bg-white dark:bg-gray-800/50"
			whileHover={{ scale: 1.02, y: -2 }}
			whileTap={{ scale: 0.98 }}
		>
			<div className="flex items-start gap-4">
				<div
					className={`p-3 bg-gradient-to-r ${func.color} rounded-lg group-hover:scale-110 transition-transform shadow-lg`}
				>
					<IconComponent className="text-white text-xl" />
				</div>
				<div className="flex-1">
					<h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-primary-light transition-colors">
						{func.title}
					</h4>
					<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
						{func.description}
					</p>
				</div>
			</div>
		</motion.button>
	);
};

const SimilarQuestionCard = ({ question }: { question: SimilarQuestion }) => (
	<div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
		<div className="flex items-start justify-between">
			<div className="flex-1">
				{question.title && (
					<h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
						{question.title}
					</h4>
				)}
				<p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
					{question.content}
				</p>
			</div>
			<div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-3">
				<span>{question.answerCount} answers</span>
				<span>{question.upvotes} upvotes</span>
			</div>
		</div>
	</div>
);

// Main Component
export default function AIModal({
	isOpen,
	onClose,
	onSelect,
	precontent = "",
	groupId,
	questionId,
}: Readonly<AIModalProps>) {
	const [selectedFunction, setSelectedFunction] = useState<AIFunction | null>(
		null
	);
	const [inputText, setInputText] = useState("");
	const [aiResponse, setAiResponse] = useState("");
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [similarQuestions, setSimilarQuestions] = useState<SimilarQuestion[]>(
		[]
	);

	// Parse AI responses into structured format
	const parsedResponses = useMemo(() => {
		if (!aiResponse) return [];
		return parseNumberedResponses(aiResponse);
	}, [aiResponse]);

	// Helper functions
	const resetState = () => {
		setSelectedFunction(null);
		setInputText("");
		setAiResponse("");
		setError(null);
		setSimilarQuestions([]);
		setIsProcessing(false);
	};

	const handleClose = () => {
		resetState();
		onClose();
	};

	const handleFunctionSelect = (functionId: AIFunction) => {
		setSelectedFunction(functionId);
		setInputText(precontent);
	};

	const handleBack = () => {
		setSelectedFunction(null);
		setInputText("");
	};

	const handleResponseSelect = (response: string) => {
		// Call the onSelect callback if provided
		if (onSelect) {
			onSelect(response);
		}
		// Close the modal
		handleClose();
	};

	// API handlers
	const handleGenerateQuestion = async (
		content: string,
		additionalContext?: string
	) => {
		if (!groupId)
			throw new Error("Group ID is required for question generation");

		const response = await aiService.generateQuestions(
			groupId,
			content,
			additionalContext,
			3
		);
		setAiResponse(response.text);
		setIsProcessing(false);
	};

	const handleGenerateAnswer = async (additionalContext?: string) => {
		if (!questionId)
			throw new Error("Question ID is required for answer generation");

		const response = await aiService.generateAnswer(
			questionId,
			additionalContext
		);
		setAiResponse(response.text);
		setIsProcessing(false);
	};

	const handleFindSimilarQuestions = async (content: string) => {
		if (!groupId)
			throw new Error("Group ID is required for finding similar questions");

		const response = await aiService.findSimilarQuestions(groupId, content, 5);
		setSimilarQuestions(response.similarQuestions);
		setIsProcessing(false);
	};

	const handleSubmit = async () => {
		if (!selectedFunction) return;

		const hasNoInput = !precontent && !inputText.trim();
		if (hasNoInput) return;

		setIsProcessing(true);
		setError(null);
		setAiResponse("");
		setSimilarQuestions([]);

		const content = precontent || inputText.trim();
		const additionalContext = inputText.trim() || undefined;

		try {
			switch (selectedFunction) {
				case "generate-question":
					await handleGenerateQuestion(content, additionalContext);
					break;
				case "generate-answer":
					await handleGenerateAnswer(additionalContext);
					break;
				case "similar-question":
					await handleFindSimilarQuestions(content);
					break;
				default:
					throw new Error("Unknown AI function");
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			const isApiKeyError =
				errorMessage.includes("API") || errorMessage.includes("key");
			setError(
				isApiKeyError
					? "AI service is not configured. Please set up the GEMINI_API_KEY environment variable to enable AI features."
					: errorMessage
			);
			setIsProcessing(false);
		}
	};

	// Computed values
	const selectedFunctionData = AI_FUNCTIONS.find(
		(f) => f.id === selectedFunction
	);
	const isSubmitDisabled = (!precontent && !inputText.trim()) || isProcessing;
	const hasResponse = aiResponse || error || similarQuestions.length > 0;

	// Render helpers
	const renderHeader = () => (
		<div className="relative p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{selectedFunction ? (
						<button
							onClick={handleBack}
							className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
						>
							<RiArrowLeftFill className="text-xl text-gray-600 dark:text-gray-400" />
						</button>
					) : (
						<div className="p-2 bg-gradient-to-r from-primary to-accent rounded-lg">
							<RiSparklingFill className="text-white text-xl" />
						</div>
					)}
					<div>
						<h2 className="text-xl font-semibold text-gray-900 dark:text-white">
							{selectedFunction ? selectedFunctionData?.title : "AI Assistant"}
						</h2>
						<p className="text-sm text-gray-500 dark:text-gray-400">
							{selectedFunction
								? selectedFunctionData?.description
								: "Choose an AI function to get started"}
						</p>
					</div>
				</div>
				<button
					onClick={handleClose}
					className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
				>
					<RiCloseFill className="text-xl text-gray-500 dark:text-gray-400" />
				</button>
			</div>
		</div>
	);

	const renderFunctionSelection = () => (
		<div className="space-y-4">
			<h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
				What would you like AI to help you with?
			</h3>
			<div className="grid gap-4">
				{AI_FUNCTIONS.map((func) => (
					<FunctionCard
						key={func.id}
						func={func}
						onSelect={handleFunctionSelect}
					/>
				))}
			</div>
		</div>
	);

	const renderInputForm = () => {
		if (!selectedFunctionData) return null;

		return (
			<div className="space-y-6">
				{/* Function Header */}
				<div className="flex items-center gap-3 mb-6">
					<div
						className={`p-3 bg-gradient-to-r ${selectedFunctionData.color} rounded-lg shadow-lg`}
					>
						<selectedFunctionData.icon className="text-white text-xl" />
					</div>
					<div>
						<h4 className="font-semibold text-gray-900 dark:text-white text-lg">
							{selectedFunctionData.title}
						</h4>
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{selectedFunctionData.description}
						</p>
					</div>
				</div>

				{/* Input Area */}
				<div className="space-y-4">
					{precontent && (
						<div className="p-4 bg-gray-100 dark:bg-gray-700/30 rounded-lg border border-gray-200 dark:border-gray-600">
							<h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Context:
							</h5>
							<p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
								{precontent}
							</p>
						</div>
					)}

					<div className="relative">
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							{precontent ? "Additional input (optional):" : "Your input:"}
						</label>
						<textarea
							value={inputText}
							onChange={(e) => setInputText(e.target.value)}
							placeholder="Add any additional context or specific requirements..."
							className="textarea-modern w-full h-40 p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:focus:border-primary-light transition-all"
							disabled={isProcessing}
							maxLength={1000}
						/>
						<div className="absolute bottom-3 right-3 text-xs text-gray-400">
							{inputText.length}/1000
						</div>
					</div>
				</div>

				{/* Response Section */}
				{hasResponse && (
					<div className="space-y-4">
						<h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
							AI Response:
						</h5>

						{error && (
							<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
								<p className="text-sm text-red-700 dark:text-red-300">
									Error: {error}
								</p>
							</div>
						)}

						{parsedResponses.length > 0 && (
							<div className="space-y-3">
								<p className="text-xs text-gray-500 dark:text-gray-400">
									Click on any response to use it
								</p>
								{parsedResponses.map((response, index) => (
									<ResponseCard
										key={index}
										response={response}
										index={index}
										onSelect={handleResponseSelect}
									/>
								))}
							</div>
						)}

						{similarQuestions.length > 0 && (
							<div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
								<h6 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
									Similar Questions Found:
								</h6>
								<div className="space-y-2">
									{similarQuestions.map((q) => (
										<SimilarQuestionCard key={q.id} question={q} />
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Action Buttons */}
				<div className="flex justify-end gap-3 pt-4">
					<button
						onClick={handleBack}
						className="px-5 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
						disabled={isProcessing}
					>
						Back
					</button>
					<motion.button
						onClick={handleSubmit}
						disabled={isSubmitDisabled}
						className={`px-6 py-2.5 bg-gradient-to-r ${selectedFunctionData.color} text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg hover:shadow-xl`}
						whileHover={{ scale: isSubmitDisabled ? 1 : 1.02 }}
						whileTap={{ scale: isSubmitDisabled ? 1 : 0.98 }}
					>
						{isProcessing ? (
							<>
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								Processing...
							</>
						) : (
							<>
								<RiSendPlaneFill className="text-sm" />
								{selectedFunctionData.buttonText}
							</>
						)}
					</motion.button>
				</div>
			</div>
		);
	};

	return (
		<>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={handleClose}
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ duration: 0.3 }}
						>
							{renderHeader()}

							<div className="p-6 max-h-[70vh] overflow-y-auto">
								{!selectedFunction
									? renderFunctionSelection()
									: renderInputForm()}
							</div>
						</motion.div>
					</div>
				</>
			)}
		</>
	);
}
