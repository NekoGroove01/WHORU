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
			path: "./fonts/Pretendard-Regular.woff2",
			weight: "400",
			style: "normal",
		},
		{
			path: "./fonts/Pretendard-Medium.woff2",
			weight: "500",
			style: "normal",
		},
		{
			path: "./fonts/Pretendard-SemiBold.woff2",
			weight: "600",
			style: "normal",
		},
		{
			path: "./fonts/Pretendard-ExtraBold.woff2",
			weight: "800",
			style: "normal",
		},
	],
	display: "swap",
	variable: "--font-pretendard",
});
