import QuestionDetail from "@/components/group/QuestionDetail";
import AnswerInput from "@/components/group/AnswerInput";


type CurrentQuestion = {
    params: {
        groupId: string;
        questionId: string;
    }
}


export default async function QuestionPage({ params }: CurrentQuestion){
    const {groupId, questionId} = await params;

    return(
        <div className="space-y-4">
            <QuestionDetail groupId={groupId} questionId={questionId}/>
            <AnswerInput/>
        </div>

    );
}