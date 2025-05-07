// components/ApiDocument/ServerList.tsx

export default function ServerList({ servers }: Readonly<ServerListProps>) {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
			<h2 className="!text-2xl !font-semibold text-gray-900 dark:text-white mb-4">
				Servers
			</h2>
			<div className="space-y-4">
				{servers.map((server, index) => (
					<div
						key={server.url.slice(0, 20) + index}
						className="p-4 border border-gray-200 dark:border-gray-700 rounded-md"
					>
						<div className="flex flex-col md:flex-row md:items-center justify-between">
							<div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
								{server.url}
							</div>
							<div className="mt-2 md:mt-0 text-sm text-gray-600 dark:text-gray-300">
								{server.description}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
