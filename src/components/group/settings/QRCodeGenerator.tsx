"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code"; // Placeholder for QR code library
import { FaDownload } from "react-icons/fa";

type QRCodeGeneratorProps = {
	url: string;
	size?: number;
	groupName: string;
};

export default function QRCodeGenerator({
	url,
	size = 512,
	groupName,
}: Readonly<QRCodeGeneratorProps>) {
	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

	useEffect(() => {
		// In a real app, you would use a proper QR code library like qrcode.react
		// For this example, we'll simulate the QR code with a placeholder

		// Simulating QR code generation with a timeout
		const generateQR = async () => {
			await new Promise((resolve) => setTimeout(resolve, 500));

			// In a real implementation, you would use something like:
			// const qrCode = await QRCode.toDataURL(url)
			// setQrDataUrl(qrCode)

			// For this example, we'll use a placeholder image URL
			setQrDataUrl(
				`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
					url
				)}`
			);
		};

		generateQR();
	}, [url, size]);

	const handleDownload = () => {
		if (!qrDataUrl) return;

		const link = document.createElement("a");
		link.href = qrDataUrl;
		link.download = `${groupName
			.replace(/\s+/g, "-")
			.toLowerCase()}-qr-code.png`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	return (
		<div className="flex flex-col items-center">
			{qrDataUrl ? (
				<>
					<div className="border-4 border-white p-2 rounded-lg shadow-md">
						<QRCode
							value={url}
							size={size}
							className="rounded-lg"
							style={{ width: size, height: size }}
							viewBox="0 0 512 512"
						/>
					</div>

					<button
						onClick={handleDownload}
						className="mt-4 flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg transition-colors"
					>
						<FaDownload /> Download QR Code
					</button>
				</>
			) : (
				<div
					style={{ width: size, height: size }}
					className="bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg flex items-center justify-center"
				>
					<span className="text-gray-400 dark:text-gray-500">
						Generating...
					</span>
				</div>
			)}
		</div>
	);
}
