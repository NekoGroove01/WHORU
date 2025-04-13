import QuestionDetail from "@/components/group/QuestionDetail";



type CurrentQuestion = {
    params: {
        groupId: string;
        questionId: string;
    }
}


export default async function QuestionPage({ params }: CurrentQuestion){
    const {groupId, questionId} = await params;

    return(
        <QuestionDetail groupId={groupId} questionId={questionId}/>
    );
}