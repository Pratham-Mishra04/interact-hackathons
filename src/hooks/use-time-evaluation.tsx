import { useState, useEffect } from 'react';

const useTimeEvaluation = (callback: ()=>any, interval = 60000) => {
    const [result, setResult] = useState(callback());

    useEffect(() => {
        const evaluate = () => setResult(callback());

        evaluate();
        const timer = setInterval(evaluate, interval);

        return () => clearInterval(timer)
    }, [callback, interval]);

    return result;
};

export default useTimeEvaluation;