'use client';

import { useBackNavigation } from "@/hooks/useBackNavigation";
import { useQuestionStore } from "@/store/questionStore";
import { useEffect,useState } from "react";
import LoadingScreen from "../ui/LoadingScreen";
import { FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import VoteComponent from "./VoteComponent";


export default function QuestionDetail({ groupId, questionId }: { groupId:string, questionId: string}){
    const { fetchQuestions, getQuestionById } = useQuestionStore();
    const [question,setQuestion]=useState(() => getQuestionById(questionId));
    const [isLoading,setIsLoading]=useState(true);
    const { goBack }=useBackNavigation();

    useEffect(() => {
        const loadQuestion = async () => {
            setIsLoading(true);
            try {
                let fetchedQuestion = getQuestionById(questionId);
                
                if (!fetchedQuestion) {
                    await fetchQuestions(groupId); // 전체 질문 fetch
                    fetchedQuestion = getQuestionById(questionId);
                }

                setQuestion(fetchedQuestion);
            } catch (error) {
                console.error("Failed to load question detail: ", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadQuestion();
    }, [questionId, getQuestionById, fetchQuestions]);

    if(isLoading){
        return <LoadingScreen/>
    }

    if(!question){
        return <div>Question not found</div>
    }



    return(
        <div className=" relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6">
            <button
                className="flex items-center text-gray-500 px-4 py-2 rounded-md"
                onClick={goBack} // goBack 함수 호출
            >
                <motion.span
                    whileHover={{ x: -4 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="mr-2"
                >
                    <FaArrowLeft/>
                </motion.span>
                back     
            </button>
            
            <div>
                <h3 className="text-center text-xl font-semibold">{question.title}</h3>
                <h6 className="text-center text-sm text-gray-500">{question.authorName}</h6>

                <div className="flex flex-wrap gap-2 my-3 justify-center border-b p-4">
                    {question.tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="mt-4 text-gray-700 dark:text-gray-300">{question.content}</div>

                <VoteComponent question={question}/>

                <div className=" absolute bottom-2 right-2 text-sm text-gray-400">
                    {new Date(question.createdAt).toLocaleDateString()}
                </div>

            </div>
        </div>
    );
}