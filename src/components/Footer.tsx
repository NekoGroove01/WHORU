export function Footer() {
	return (
		<footer className="py-10 bg-gray-100 dark:bg-gray-800">
			<div className="container mx-auto px-6 text-center">
				<p className="text-gray-600 dark:text-gray-400">
					&copy; {new Date().getFullYear()} WHO
					<span className="logo-accent">R</span>U. All rights reserved.
				</p>
			</div>
		</footer>
	);
}
