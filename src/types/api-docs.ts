// types/api.ts - Define main types for OpenAPI schema

interface OpenAPIInfo {
	title: string;
	description: string;
	version: string;
	contact?: {
		email?: string;
		name?: string;
		url?: string;
	};
}

interface OpenAPIServer {
	url: string;
	description: string;
}

interface OpenAPITag {
	name: string;
	description: string;
}

interface OpenAPIParameter {
	name: string;
	in: string;
	description?: string;
	required?: boolean;
	schema?: OpenAPISchema;
}

interface OpenAPIRequestBody {
	description?: string;
	required?: boolean;
	content?: Record<string, { schema?: OpenAPISchema }>;
}

interface OpenAPIResponse {
	description: string;
	content?: Record<string, { schema?: OpenAPISchema }>;
}

interface OpenAPIComponents {
	schemas?: Record<string, OpenAPISchema>;
	responses?: Record<string, OpenAPIResponse>;
	parameters?: Record<string, OpenAPIParameter>;
	securitySchemes?: Record<string, unknown>;
}

interface OpenAPISchema {
	type?: string;
	format?: string;
	properties?: Record<string, OpenAPISchema>;
	items?: OpenAPISchema;
	required?: string[];
	enum?: unknown[];
	$ref?: string;
	description?: string;
}

interface OpenAPIPathItem {
	summary?: string;
	description?: string;
	operationId?: string;
	tags?: string[];
	parameters?: OpenAPIParameter[];
	requestBody?: OpenAPIRequestBody;
	responses?: Record<string, OpenAPIResponse>;
}

interface OpenAPIDocument {
	openapi: string;
	info: OpenAPIInfo;
	servers: OpenAPIServer[];
	tags: OpenAPITag[];
	paths: Record<string, Record<string, OpenAPIPathItem>>;
	components?: OpenAPIComponents;
}

// Component props interfaces

interface ApiDocumentationProps {
	apiDoc: OpenAPIDocument;
}

interface ApiHeaderProps {
	info: OpenAPIInfo;
}

interface ServerListProps {
	servers: OpenAPIServer[];
}

interface SideNavigationProps {
	tags: OpenAPITag[];
	paths: Record<string, Record<string, OpenAPIPathItem>>;
	activeTag: string;
	setActiveTag: (tag: string) => void;
	activeEndpoint: string | null;
	setActiveEndpoint: (endpoint: string | null) => void;
}

interface EndpointListProps {
	paths: Record<string, Record<string, OpenAPIPathItem>>;
	tags: OpenAPITag[];
	activeTag: string;
	components?: OpenAPIComponents;
	activeEndpoint: string | null;
	setActiveEndpoint: (endpoint: string | null) => void;
}

interface EndpointDetailProps {
	path: string;
	method: string;
	data: OpenAPIPathItem;
	components?: OpenAPIComponents;
	isActive: boolean;
	setActiveEndpoint: (endpoint: string | null) => void;
}

interface ParameterSectionProps {
	parameters?: OpenAPIParameter[];
}

interface RequestBodySectionProps {
	requestBody?: OpenAPIRequestBody;
	components?: OpenAPIComponents;
}

interface ResponsesSectionProps {
	responses?: Record<string, OpenAPIResponse>;
	components?: OpenAPIComponents;
}

interface SchemaViewerProps {
	schema?: OpenAPISchema;
	components?: OpenAPIComponents;
}

interface SchemaContentProps {
	schema: OpenAPISchema;
	components?: OpenAPIComponents;
}

interface PropertyDetailsProps {
	property: OpenAPISchema;
	components?: OpenAPIComponents;
}

interface SampleRequestResponseProps {
	title: string;
	request: string;
	response: string;
}

