import { useState, useEffect, useMemo } from "react";
import { Question } from "@/types/question"
import { useQuestionStore } from "@/store/questionStore"
import { motion } from "framer-motion";

type VoteComponentProps = {
    question: Question;
};

const buttonStyle = {
    default: "rounded-full transition-colors p-1",
    hover: { scale: 1.02 },
    tap: { scale: 0.96 },
};
  
export default function VoteComponent({ question }: VoteComponentProps) {
    const { upvoteQuestion, downvoteQuestion } = useQuestionStore();
    const [upvotes, setUpvotes] = useState(question.upvotes);
    const [downvotes, setDownvotes] = useState(question.downvotes);
    const [hasVoted, setHasVoted] = useState<"up" | "down" | null>(null);

    const handleVote = (voteType: "up" | "down") => {
		if (hasVoted === voteType) return;

		if (voteType === "up") {
            setUpvotes(prev => prev + 1);
			upvoteQuestion(question.id);
		} else {
            setDownvotes(prev => prev + 1);
			downvoteQuestion(question.id);
		}

		setHasVoted(voteType);
	};
    

    const totalVotes = upvotes + downvotes;
    const upvotePercent = totalVotes > 0 ? Math.round((upvotes / totalVotes) * 100) : 0;
    const downvotePercent = totalVotes > 0 ? Math.round((downvotes / totalVotes) * 100) : 0;


    return(
        <div className="m-5">
            <div className="flex gap-4 justify-center items-center">

                {/* upvote버튼 */}
                <motion.button
                    onClick={() => handleVote("up")}
                    className={`${buttonStyle.default}
                        ${hasVoted === "up"
                            ? "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30"
                            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                    whileHover={buttonStyle.hover}
                    whileTap={buttonStyle.tap}
                    aria-label="Upvote"
                >
                    <span>Upvote</span>
                </motion.button>

                {/*퍼센트 바 */}
                <div className="relative w-full flex">

                    <div className="absolute left-0 -top-5 text-xs text-gray-500">
                        {upvotePercent}%
                    </div>

                    <div className="absolute right-0 -top-5 text-xs text-gray-500">
                        {downvotePercent}%
                    </div>


                    <div className="w-full h-4 rounded-md overflow-hidden flex bg-gray-200">
                        {/* Upvote 퍼센트 */}
                        <div
                            className="bg-blue-500 h-full"
                            style={{ width: `${upvotePercent}%` }}
                        />
                        {/* Downvote 퍼센트 */}
                        <div
                            className="bg-red-500 h-full"
                            style={{ width: `${downvotePercent}%` }}
                        />
                    </div>

                </div>


                {/*downvote 버튼 */}
                <motion.button
                    onClick={() => handleVote("down")}
                    className={`${buttonStyle.default} ${
                        hasVoted === "down"
                            ? "text-red-500 bg-red-50 dark:bg-red-900/30"
                            : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                    whileHover={buttonStyle.hover}
                    whileTap={buttonStyle.tap}
                    aria-label="Downvote"
                >
                    <span>Downvote</span>
                </motion.button>

            </div>
        </div>
    );
    
}