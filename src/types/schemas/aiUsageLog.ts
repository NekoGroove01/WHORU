import { ObjectId } from "mongodb";

interface AIUsageLog {
	_id: ObjectId;
	identityType: "session" | "group"; // How the user/group is identified
	identifier: string; // Session ID, IP hash, or Group ID
	featureType:
		| "similarQuestion"
		| "generateQuestion"
		| "generateAnswer"
		| "chat";
	timestamp: Date;
	groupId?: ObjectId; // If usage is tied to a group context
}
