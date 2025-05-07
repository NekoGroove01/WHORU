// components/docs/ApiDocumentation.tsx
"use client";

import { useState } from "react";
import ApiHeader from "./ApiHeader";
import SideNavigation from "./SideNavigation";
import EndpointList from "./EndpointList";
import ServerList from "./ServerList";
import SampleSection from "./SampleSection";

export default function ApiDocumentation({
	apiDoc,
}: Readonly<ApiDocumentationProps>) {
	const [activeTag, setActiveTag] = useState("all");
	const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);

	return (
		<div className="container mx-auto px-4 py-8">
			<ApiHeader info={apiDoc.info} />

			<div className="flex flex-col lg:flex-row gap-8 mt-8">
				<aside className="lg:w-1/4">
					<div className="sticky top-4">
						<SideNavigation
							tags={apiDoc.tags}
							paths={apiDoc.paths}
							activeTag={activeTag}
							setActiveTag={setActiveTag}
							activeEndpoint={activeEndpoint}
							setActiveEndpoint={setActiveEndpoint}
						/>
					</div>
				</aside>

				<main className="lg:w-3/4">
					<ServerList servers={apiDoc.servers} />

					<div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
						<EndpointList
							paths={apiDoc.paths}
							tags={apiDoc.tags}
							activeTag={activeTag}
							components={apiDoc.components}
							activeEndpoint={activeEndpoint}
							setActiveEndpoint={setActiveEndpoint}
						/>
					</div>

					<div className="mt-8">
						<SampleSection />
					</div>
				</main>
			</div>
		</div>
	);
}
