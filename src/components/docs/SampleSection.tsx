// components/ApiDocument/SampleSection.tsx
export default function SampleSection() {
	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
			<h2 className="!text-2xl !font-semibold text-gray-900 dark:text-white mb-4">
				Sample API Requests and Responses
			</h2>

			<div className="space-y-8">
				<SampleRequestResponse
					title="Creating a New Group"
					request={`POST /groups
  Content-Type: application/json
  
  {
    "name": "JavaScript Help Group",
    "description": "Ask questions about JavaScript programming",
    "isPublic": true,
    "settings": {
      "allowVoting": true,
      "allowAnonymousQuestions": true,
      "allowTagging": true,
      "moderationEnabled": false
    }
  }`}
					response={`Status: 201 Created
  Content-Type: application/json
  
  {
    "id": "60d21b4667d0d8992e610c85",
    "name": "JavaScript Help Group",
    "description": "Ask questions about JavaScript programming",
    "isPublic": true,
    "createdAt": "2023-08-15T14:22:36.123Z",
    "expiresAt": null,
    "settings": {
      "allowVoting": true,
      "allowAnonymousQuestions": true,
      "allowTagging": true,
      "moderationEnabled": false
    },
    "tags": [],
    "memberCount": 1
  }`}
				/>

				<SampleRequestResponse
					title="Posting a Question with Media"
					request={`POST /groups/60d21b4667d0d8992e610c85/questions
  Content-Type: application/json
  
  {
    "content": "How do I fix this 'cannot read property of undefined' error?",
    "tags": ["debugging", "error-handling"],
    "mediaIds": ["60d21c1267d0d8992e610c86"],
    "poll": {
      "options": [
        "It's a scope issue",
        "You're accessing a property too early",
        "You need to check for null first"
      ],
      "allowMultiple": false
    }
  }`}
					response={`Status: 201 Created
  Content-Type: application/json
  
  {
    "id": "60d21d5367d0d8992e610c88",
    "groupId": "60d21b4667d0d8992e610c85",
    "content": "How do I fix this 'cannot read property of undefined' error?",
    "tags": ["debugging", "error-handling"],
    "status": "open",
    "createdAt": "2023-08-15T14:28:19.346Z",
    "tempNickname": "CuriousFox",
    "upvotes": 0,
    "views": 1,
    "mediaAttachments": [
      {
        "mediaId": "60d21c1267d0d8992e610c86",
        "url": "https://storage.whoru.app/media/q-60d21c1267d0d8992e610c86.png",
        "thumbnailUrl": "https://storage.whoru.app/media/q-60d21c1267d0d8992e610c86-thumb.png",
        "mimeType": "image/png",
        "displayOrder": 0
      }
    ],
    "poll": {
      "options": [
        "It's a scope issue",
        "You're accessing a property too early",
        "You need to check for null first"
      ],
      "votes": [
        {"option": 0, "count": 0},
        {"option": 1, "count": 0},
        {"option": 2, "count": 0}
      ],
      "allowMultiple": false
    },
    "aiSuggested": false
  }`}
				/>
			</div>
		</div>
	);
}

function SampleRequestResponse({
	title,
	request,
	response,
}: Readonly<SampleRequestResponseProps>) {
	return (
		<div>
			<h3 className="!text-xl !font-medium text-gray-800 dark:text-white mb-3">
				{title}
			</h3>

			<div className="space-y-4">
				<div>
					<h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
						Request:
					</h4>
					<pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200">
						{request}
					</pre>
				</div>

				<div>
					<h4 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
						Response:
					</h4>
					<pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md overflow-x-auto text-sm font-mono text-gray-800 dark:text-gray-200">
						{response}
					</pre>
				</div>
			</div>
		</div>
	);
}
