// components/ApiDocument/EndpointList.tsx
export default function EndpointList({
	paths,
	activeTag,
	components,
	activeEndpoint,
	setActiveEndpoint,
}: Readonly<EndpointListProps>) {
	const filteredPaths: Record<string, Record<string, OpenAPIPathItem>> = {};

	// Filter paths based on activeTag
	Object.entries(paths).forEach(([path, methods]) => {
		Object.entries(methods).forEach(([method, data]) => {
			if (activeTag === "all" || data.tags?.includes(activeTag)) {
				filteredPaths[path] ??= {};
				filteredPaths[path][method] = data;
			}
		});
	});

	return (
		<div>
			<h2 className="!text-2xl !font-semibold text-gray-900 dark:text-white mb-6">
				{activeTag === "all" ? "All Endpoints" : `${activeTag} Endpoints`}
			</h2>

			<div className="space-y-10">
				{Object.entries(filteredPaths).map(([path, methods]) => (
					<div
						key={path}
						className="border-b border-gray-200 dark:border-gray-700 pb-10 last:border-0"
					>
						<h3 className="!text-base !font-mono text-gray-800 dark:text-gray-200 mb-4">
							{path}
						</h3>

						<div className="space-y-6">
							{Object.entries(methods).map(([method, data]) => (
								<EndpointDetail
									key={`${method}-${path}`}
									path={path}
									method={method}
									data={data}
									components={components}
									isActive={activeEndpoint === `${method}:${path}`}
									setActiveEndpoint={setActiveEndpoint}
								/>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function EndpointDetail({
	path,
	method,
	data,
	components,
	isActive,
	setActiveEndpoint,
}: Readonly<EndpointDetailProps>) {
	const handleToggle = () => {
		setActiveEndpoint(isActive ? null : `${method}:${path}`);
	};

	return (
		<div
			className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${
				isActive ? "ring-2 ring-primary" : ""
			}`}
		>
			<button
				className="flex w-full items-center cursor-pointer p-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
				onClick={handleToggle}
			>
				<div
					className={`inline-block uppercase font-bold px-3 py-1 rounded-md text-sm ${getMethodBadgeClasses(
						method
					)}`}
				>
					{method}
				</div>
				<div className="ml-4 flex-grow">
					<h4 className="text-md font-medium text-gray-800 dark:text-white">
						{data.summary}
					</h4>
					<p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
						{data.description ?? "No description provided"}
					</p>
				</div>
				<div className="text-gray-500">{isActive ? "−" : "+"}</div>
			</button>

			{isActive && (
				<div className="p-4 border-t border-gray-200 dark:border-gray-700">
					<ParameterSection parameters={data.parameters} />
					<RequestBodySection
						requestBody={data.requestBody}
						components={components}
					/>
					<ResponsesSection
						responses={data.responses}
						components={components}
					/>
				</div>
			)}
		</div>
	);
}

function getMethodBadgeClasses(method: string) {
	const classes: Record<string, string> = {
		get: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
		post: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
		put: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
		delete: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
		patch:
			"bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
	};
	return (
		classes[method] ||
		"bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
	);
}

// Subcomponents for the endpoint details
function ParameterSection({ parameters }: Readonly<ParameterSectionProps>) {
	if (!parameters || parameters.length === 0) return null;

	return (
		<div className="mt-4">
			<h5 className="text-md font-medium text-gray-800 dark:text-white mb-2">
				Parameters
			</h5>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
					<thead className="bg-gray-50 dark:bg-gray-700">
						<tr>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Name
							</th>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								In
							</th>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Type
							</th>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Required
							</th>
							<th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
								Description
							</th>
						</tr>
					</thead>
					<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
						{parameters.map((param, index) => (
							<tr key={param.name.slice(0, 20) + index}>
								<td className="px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300">
									{param.name}
								</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
									{param.in}
								</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
									{param.schema?.type ?? "object"}
								</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
									{param.required ? (
										<span className="text-red-600 dark:text-red-400">Yes</span>
									) : (
										<span className="text-gray-400">No</span>
									)}
								</td>
								<td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
									{param.description ?? "-"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function RequestBodySection({
	requestBody,
	components,
}: Readonly<RequestBodySectionProps>) {
	if (!requestBody) return null;

	return (
		<div className="mt-6">
			<h5 className="text-md font-medium text-gray-800 dark:text-white mb-2">
				Request Body
			</h5>
			<div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
				<p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
					{requestBody.description ?? "No description provided"}
				</p>
				<div className="mt-2">
					<p className="text-sm text-gray-500 dark:text-gray-400">
						{requestBody.required ? (
							<span className="text-red-600 dark:text-red-400">Required</span>
						) : (
							<span>Optional</span>
						)}
					</p>
				</div>

				{requestBody.content &&
					Object.entries(requestBody.content).map(([contentType, content]) => (
						<div key={contentType} className="mt-3">
							<div className="font-mono text-xs text-gray-600 dark:text-gray-300 mb-2">
								{contentType}
							</div>
							<div className="bg-gray-100 dark:bg-gray-600 p-3 rounded">
								<SchemaViewer schema={content.schema} components={components} />
							</div>
						</div>
					))}
			</div>
		</div>
	);
}

function ResponsesSection({
	responses,
	components,
}: Readonly<ResponsesSectionProps>) {
	if (!responses) return null;

	return (
		<div className="mt-6">
			<h5 className="text-md font-medium text-gray-800 dark:text-white mb-2">
				Responses
			</h5>
			<div className="space-y-4">
				{Object.entries(responses).map(([status, response]) => (
					<div
						key={status}
						className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md"
					>
						<div className="flex items-center">
							<span
								className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusBadgeClass(
									status
								)}`}
							>
								{status}
							</span>
							<span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
								{response.description}
							</span>
						</div>

						{response.content &&
							Object.entries(response.content).map(([contentType, content]) => (
								<div key={contentType} className="mt-3">
									<div className="font-mono text-xs text-gray-600 dark:text-gray-300 mb-2">
										{contentType}
									</div>
									<div className="bg-gray-100 dark:bg-gray-600 p-3 rounded">
										<SchemaViewer
											schema={content.schema}
											components={components}
										/>
									</div>
								</div>
							))}
					</div>
				))}
			</div>
		</div>
	);
}

function SchemaViewer({ schema, components }: Readonly<SchemaViewerProps>) {
	if (!schema) {
		return (
			<div className="text-sm text-gray-500 dark:text-gray-400">
				No schema defined.
			</div>
		);
	}

	// If the schema has a $ref, resolve it from components
	if (schema.$ref) {
		const refPath = schema.$ref.replace("#/components/schemas/", "");
		if (components?.schemas?.[refPath]) {
			// Render the resolved schema
			return (
				<SchemaContent
					schema={components.schemas[refPath]}
					components={components}
				/>
			);
		}
		// If reference cannot be resolved, display the reference path
		return (
			<div className="font-mono text-sm text-red-500 dark:text-red-400">
				Unresolved reference: {schema.$ref}
			</div>
		);
	}

	// If not a reference, render the schema content directly
	return <SchemaContent schema={schema} components={components} />;
}

/**
 * Renders the content of an OpenAPI schema based on its type (object, array, primitive).
 * This component handles the layout for different schema types.
 */
function SchemaContent({ schema, components }: Readonly<SchemaContentProps>) {
	const type = Array.isArray(schema.type) ? schema.type[0] : schema.type; // Handle cases where type might be an array

	// Handle object type schema
	if (type === "object") {
		return (
			<div className="space-y-1">
				{" "}
				{/* Vertical spacing between properties */}
				{schema.properties && Object.entries(schema.properties).length > 0 ? (
					Object.entries(schema.properties).map(([name, propSchema]) => (
						<div key={name} className="py-0.5">
							{" "}
							{/* Minimal vertical padding for each property line */}
							<div className="flex items-baseline">
								{" "}
								{/* Align property name and its details */}
								{/* Property Name */}
								<div className="font-mono text-sm text-gray-700 dark:text-gray-300 shrink-0 pr-1">
									{name}
									{schema.required?.includes(name) && (
										<span className="text-red-500 dark:text-red-400 ml-1 text-xs">
											*
										</span>
									)}
									<span className="text-gray-400 dark:text-gray-500">:</span>
								</div>
								{/* Property Details (type, description, nested schema) */}
								<div className="ml-2 flex-grow">
									<PropertyDetails
										property={propSchema}
										components={components}
									/>
								</div>
							</div>
						</div>
					))
				) : (
					<div className="text-sm text-gray-500 dark:text-gray-400">
						(empty object)
					</div>
				)}
			</div>
		);
	}

	// Handle array type schema
	if (type === "array") {
		return (
			<div className="text-sm">
				{/* Type is displayed by PropertyDetails if this array is a property. 
				    If this is a top-level array schema, this context is slightly different.
				    The image implies array items are just listed under the property.
				    PropertyDetails will show "array" badge, then this will detail items.
				*/}
				{schema.items ? (
					<div className="mt-1">
						{" "}
						{/* Spacing for items block */}
						<span className="text-xs text-gray-500 dark:text-gray-400 italic">
							items:
						</span>
						<div className="pl-4 border-l-2 border-gray-200 dark:border-gray-600">
							<SchemaViewer schema={schema.items} components={components} />
						</div>
					</div>
				) : (
					<div className="text-sm text-gray-500 dark:text-gray-400">
						(empty array)
					</div>
				)}
			</div>
		);
	}

	// Handle primitive types (string, number, integer, boolean) and other simple types
	return (
		<div className="text-sm text-gray-700 dark:text-gray-300">
			{/* Type and format are primarily handled by PropertyDetails if this is part of a property.
			    If this is a top-level simple schema, this will be the main display.
			*/}
			<span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
				{type ?? "any"}
			</span>
			{schema.format && (
				<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
					({schema.format})
				</span>
			)}
			{schema.description && (
				<p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
					{schema.description}
				</p>
			)}
			{schema.enum && (
				<div className="mt-1 text-xs">
					<span className="text-gray-500 dark:text-gray-400">Enum: </span>
					<span className="text-gray-600 dark:text-gray-300">
						{schema.enum.join(", ")}
					</span>
				</div>
			)}
		</div>
	);
}

/**
 * Renders details for a single property within an object schema, including its type,
 * description, and any nested structures (like sub-objects or arrays).
 */
function PropertyDetails({
	property,
	components,
}: Readonly<PropertyDetailsProps>) {
	// If the property itself is a reference, resolve and render it.
	if (property.$ref) {
		// SchemaViewer handles $ref resolution and calls SchemaContent.
		return <SchemaViewer schema={property} components={components} />;
	}

	const type = Array.isArray(property.type) ? property.type[0] : property.type; // Handle cases where type might be an array

	// Display for the type of the property (e.g., string, integer, object, array)
	const typeDisplay = (
		<span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
			{type ?? "any"}
			{/* If type is undefined, show 'any' or handle as error */}
		</span>
	);

	return (
		<div className="text-sm">
			{/* First line: Type badge and description */}
			<div className="flex items-baseline">
				{typeDisplay}
				{property.description && (
					<span className="text-xs text-gray-600 dark:text-gray-400">
						{property.description}
					</span>
				)}
			</div>

			{/* Handle nested object properties */}
			{type === "object" && (
				<div className="mt-1 border-l-2 border-gray-200 dark:border-gray-600 pl-2">
					{/* Use SchemaContent to render the properties of the nested object */}
					<SchemaContent schema={property} components={components} />
				</div>
			)}

			{/* Handle array items */}
			{type === "array" && (
				<div className="mt-1 pl-2">
					{" "}
					{/* Indent for array items section, border handled by SchemaContent for array type */}
					{/* SchemaContent for array type will add its own border and "items:" label */}
					<SchemaContent schema={property} components={components} />
				</div>
			)}

			{/* Display format and enum values for non-object/non-array types */}
			{type !== "object" && type !== "array" && (
				<>
					{property.format && (
						<span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
							({property.format})
						</span>
					)}
					{property.enum && (
						<div className="mt-0.5 text-xs">
							{" "}
							{/* Reduced margin top for tighter packing */}
							<span className="text-gray-500 dark:text-gray-400">Enum: </span>
							<span className="text-gray-600 dark:text-gray-300">
								{property.enum.join(", ")}
							</span>
						</div>
					)}
				</>
			)}
		</div>
	);
}

function getStatusBadgeClass(status: string) {
	const code = parseInt(status, 10);
	if (code >= 200 && code < 300) {
		return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
	} else if (code >= 300 && code < 400) {
		return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
	} else if (code >= 400 && code < 500) {
		return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
	} else if (code >= 500) {
		return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
	}
	return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
}
