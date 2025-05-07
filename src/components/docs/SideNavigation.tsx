// components/ApiDocument/SideNavigation.tsx
import { useState } from "react";

export default function SideNavigation({
	tags,
	paths,
	activeTag,
	setActiveTag,
	activeEndpoint,
	setActiveEndpoint,
}: Readonly<SideNavigationProps>) {
	const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});

	// Group endpoints by their tags
	const endpointsByTag: Record<
		string,
		Array<{ path: string; method: string; summary: string }>
	> = {};
	Object.entries(paths || {}).forEach(([path, methods]) => {
		Object.entries(methods).forEach(([method, data]) => {
			const tag = data.tags?.[0] ?? "other";
			endpointsByTag[tag] ??= [];
			endpointsByTag[tag].push({
				path,
				method,
				summary: data.summary ?? path,
			});
		});
	});

	const toggleExpand = (tag: string) => {
		setIsExpanded((prev) => ({ ...prev, [tag]: !prev[tag] }));
	};

	const handleEndpointClick = (path: string, method: string) => {
		setActiveEndpoint(`${method}:${path}`);
	};

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
			<h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
				API Endpoints
			</h2>

			<ul className="space-y-2">
				<li>
					<button
						className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
							activeTag === "all"
								? "bg-primary text-white"
								: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
						}`}
						onClick={() => setActiveTag("all")}
					>
						All Endpoints
					</button>
				</li>

				{tags.map((tag) => (
					<li key={tag.name}>
						<div className="flex items-center justify-between">
							<button
								className={`flex-grow text-left px-3 py-2 rounded-md text-sm font-medium ${
									activeTag === tag.name
										? "bg-primary text-white"
										: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
								}`}
								onClick={() => {
									setActiveTag(tag.name);
									toggleExpand(tag.name);
								}}
							>
								{tag.name}
							</button>
							<button
								className="p-1 text-gray-500 dark:text-gray-400"
								onClick={() => toggleExpand(tag.name)}
							>
								{isExpanded[tag.name] ? "−" : "+"}
							</button>
						</div>

						{isExpanded[tag.name] && endpointsByTag[tag.name] && (
							<ul className="ml-4 mt-1 space-y-1">
								{endpointsByTag[tag.name].map((endpoint, index) => (
									<li key={endpoint.path.slice(0, 20) + index}>
										<button
											className={`w-full text-left px-3 py-1.5 rounded-md text-xs ${
												activeEndpoint === `${endpoint.method}:${endpoint.path}`
													? "bg-gray-200 dark:bg-gray-700 font-medium"
													: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
											}`}
											onClick={() =>
												handleEndpointClick(endpoint.path, endpoint.method)
											}
										>
											<span
												className={`inline-block w-16 uppercase ${getMethodColor(
													endpoint.method
												)}`}
											>
												{endpoint.method}
											</span>
											<span className="font-mono">
												{formatPath(endpoint.path)}
											</span>
										</button>
									</li>
								))}
							</ul>
						)}
					</li>
				))}
			</ul>
		</div>
	);
}

function getMethodColor(method: string) {
	const colors: Record<string, string> = {
		get: "text-green-600 dark:text-green-400",
		post: "text-blue-600 dark:text-blue-400",
		put: "text-yellow-600 dark:text-yellow-400",
		delete: "text-red-600 dark:text-red-400",
		patch: "text-purple-600 dark:text-purple-400",
	};
	return colors[method] || "text-gray-600 dark:text-gray-400";
}

function formatPath(path: string) {
	return path.length > 25 ? path.substring(0, 25) + "..." : path;
}
