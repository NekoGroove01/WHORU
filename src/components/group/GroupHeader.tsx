"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaArrowLeft, FaCopy, FaCheck, FaQuestionCircle } from "react-icons/fa";
import { Group } from "@/types/group";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import { FaGear } from "react-icons/fa6";
import { useRouter } from "next/navigation";

interface GroupHeader {
	group: Group;
}

export default function GroupHeader({ group }: Readonly<GroupHeader>) {
	const router = useRouter();
	const [copied, setCopied] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [password, setPassword] = useState("");
	const [isValidating, setIsValidating] = useState(false);
	const [passwordError, setPasswordError] = useState<string | null>(null);
	const [isValidPassword, setIsValidPassword] = useState(false);

	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// 패스워드 검증 함수
	const validatePassword = useCallback(
		async (passwordValue: string) => {
			if (passwordValue.length < 6) {
				setPasswordError("Password must be at least 6 characters");
				setIsValidPassword(false);
				return;
			}

			setIsValidating(true);
			setPasswordError(null);

			try {
				const response = await fetch(`/api/groups/${group.id}/settings`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ adminPassword: passwordValue }),
				});

				if (response.ok) {
					setIsValidPassword(true);
					setPasswordError(null);
				} else {
					setIsValidPassword(false);
					setPasswordError("Invalid admin password");
				}
			} catch (error) {
				console.error("Password validation error:", error);
				setPasswordError("Failed to validate password");
				setIsValidPassword(false);
			} finally {
				setIsValidating(false);
			}
		},
		[group.id]
	);

	// 디바운스가 적용된 패스워드 변경 핸들러
	const handlePasswordChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setPassword(value);
			setIsValidPassword(false);
			setPasswordError(null);

			// 이전 타이머 제거
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}

			// 새 타이머 설정 (500ms 디바운스)
			if (value.trim()) {
				debounceTimerRef.current = setTimeout(() => {
					validatePassword(value);
				}, 500);
			}
		},
		[validatePassword]
	);

	// Settings 페이지로 이동
	const handleSettingsSubmit = () => {
		if (isValidPassword) {
			// 세션 스토리지에 인증 토큰과 타임스탬프 저장 (24시간 유효)
			const authToken = `admin_${group.id}_${Date.now()}`;
			sessionStorage.setItem(`admin_auth_${group.id}`, authToken);
			sessionStorage.setItem(
				`admin_auth_timestamp_${group.id}`,
				Date.now().toString()
			);

			// Settings 페이지로 이동
			router.push(`/group/${group.id}/settings`);
		}
	};

	// 컴포넌트 언마운트 시 타이머 정리
	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	// navigation for going previous page
	const { goBack } = useBackNavigation("/");

	const copyGroupLink = () => {
		let inviteLink = `${window.location.origin}/group/${group.id}`;

		// Private group이면 accessKey를 파라미터로 추가
		if (!group.isPublic && group.accessKey) {
			inviteLink += `?accessKey=${group.accessKey}`;
		}

		navigator.clipboard.writeText(inviteLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div className=" bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
			<div className="container mx-auto my-4 px-4 py-4">
				<div className="flex items-center my-2">
					<button
						onClick={goBack}
						className="text-primary dark:text-primary-light mr-3 flex items-center hover:underline"
					>
						<FaArrowLeft className="mr-1" /> Back
					</button>

					<motion.button
						onClick={copyGroupLink}
						whileTap={{ scale: 0.95 }}
						className="text-sm flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
					>
						{copied ? (
							<>
								<FaCheck className="mr-1 text-green-500" />
								<span>Copied!</span>
							</>
						) : (
							<>
								<FaCopy className="mr-1" />
								<span>Share</span>
							</>
						)}
					</motion.button>
					<div className="ml-auto md:mr-2 flex items-center gap-1.5 hover:underline">
						<FaGear className="inline-block text-primary dark:text-primary-light" />{" "}
						<button
							className="text-primary dark:text-primary-light mr-3"
							onClick={() => setShowSettings(!showSettings)}
						>
							Settings
						</button>
					</div>
				</div>

				<div className="flex justify-between items-center p-0 m-0 mt-4">
					<h1 className=" !text-4xl !md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
						{group.name}
					</h1>
					{showSettings && (
						<AnimatePresence>
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								className="flex flex-col gap-2"
							>
								<div className="flex items-center gap-2">
									<input
										type="password"
										placeholder="Enter Admin Password"
										value={password}
										onChange={handlePasswordChange}
										className={`border rounded-md px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-colors ${
											passwordError
												? "border-red-500 focus:ring-red-500"
												: isValidPassword
												? "border-green-500 focus:ring-green-500"
												: "border-gray-300 dark:border-gray-600 focus:ring-primary dark:focus:ring-primary-light"
										}`}
									/>
									<button
										onClick={handleSettingsSubmit}
										disabled={!isValidPassword || isValidating}
										className={`px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-sm transition-colors ${
											isValidPassword && !isValidating
												? "bg-primary dark:bg-primary-light text-white dark:text-gray-900 hover:bg-primary-dark dark:hover:bg-primary"
												: "bg-gray-300 text-gray-500 cursor-not-allowed"
										}`}
									>
										{isValidating ? "Validating..." : "Submit"}
									</button>
								</div>
								{passwordError && (
									<p className="text-red-500 text-xs">{passwordError}</p>
								)}
								{isValidPassword && (
									<p className="text-green-500 text-xs">Valid admin password</p>
								)}
							</motion.div>
						</AnimatePresence>
					)}
				</div>

				{group.description && (
					<p className="mt-2 text-gray-600 dark:text-gray-300 mb-3 max-w-2xl">
						{group.description}
					</p>
				)}

				<div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
					<div className="flex items-center">
						<FaQuestionCircle className="mr-1" />
						<span>{group.questionCount} questions</span>
					</div>

					<div>
						<span>Created: {formatDate(group.createdAt)}</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function formatDate(dateString?: string): string {
	if (!dateString) return "Unknown";

	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-US", {
		year: "numeric",
		month: "short",
		day: "numeric",
	}).format(date);
}
