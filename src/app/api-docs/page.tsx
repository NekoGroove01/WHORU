// app/api-docs/page.tsx
import ApiDocumentation from "@/components/docs/ApiDocumentation";
import apiDoc from "@/data/apiDocument.json";

export const metadata = {
	title: "API Documentation | WHORU",
	description: "API documentation for the WHORU anonymous Q&A platform",
};

export default function ApiDocumentPage() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<ApiDocumentation apiDoc={apiDoc} />
		</div>
	);
}
