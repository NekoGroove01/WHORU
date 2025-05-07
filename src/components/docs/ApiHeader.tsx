// components/docs/ApiHeader.tsx

export default function ApiHeader({ info }: Readonly<ApiHeaderProps>) {
	return (
		<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
			<h1 className="!text-3xl md:!text-5xl font-bold text-gray-900 dark:text-white">
				{info.title}
			</h1>
			<div className="mt-2 flex items-center">
				<span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
					v{info.version}
				</span>
				{info.contact && (
					<a
						href={`mailto:${info.contact.email}`}
						className="ml-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
					>
						{info.contact.email}
					</a>
				)}
			</div>
			<p className="mt-4 text-gray-600 dark:text-gray-300">
				{info.description}
			</p>
		</div>
	);
}
