// app/fonts.ts
import localFont from "next/font/local";

// GmarketSans 폰트
export const gmarketSans = localFont({
	src: "./fonts/GmarketSansTTFBold.ttf",
	display: "swap",
	variable: "--font-gmarket-sans",
});

// Pretendard 폰트
export const pretendard = localFont({
	src: [
		{
			path: "./fonts/Pretendard-Light.woff2",
			weight: "300",
			style: "normal",
		},
		{
			path: "./fonts/Pretendard-Medium.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "./fonts/Pretendard-Bold.woff2",
			weight: "700",
			style: "normal",
		},
	],
	display: "swap",
	variable: "--font-pretendard",
});
