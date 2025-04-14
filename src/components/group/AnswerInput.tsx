"use client";

import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";




export default function AnswerInput(){
    const [ value, setValue ] = useState('');
    const [ error, setError ] = useState(false);

    const handleSubmit = () => {
        if(!value.trim()) {
            setError(true);
            return;
        }
        
        alert('Your comment has been posted!');
        setValue('');
        setError(false);
    }

    const handleChange: React.ChangeEventHandler<HTMLTextAreaElement> = (e) => {
        setValue(e.target.value);
        if (error) setError(false);
    }

    return (
        <div className ="relative w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 flex flex-col min-h-[150px]">
            <TextareaAutosize
                className={`border rounded p-2 focus:outline-none focus:border-blue-500 resize-none mb-4 ${
                    error ? "!border-red-500" : "border-gray-300"
                }`}
                placeholder="Write a comment"
                value={value}
                onChange={handleChange}
                minRows={1}
            />

            <button 
                className=" btn-primary flex items-center justify-center gap-2"
                onClick={ handleSubmit }
            >
                Add Comment
            </button>               
        </div>

    );



}

