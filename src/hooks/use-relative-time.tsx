import { useState, useEffect } from 'react';
import moment from 'moment';

const useRelativeTime = (timestamp: Date | undefined, interval = 60000) => {
    const [relativeTime, setRelativeTime] = useState(() => moment(timestamp).fromNow());

    useEffect(() => {
        const updateRelativeTime = () => setRelativeTime(moment(timestamp).fromNow());

        updateRelativeTime();
        const timer = setInterval(updateRelativeTime, interval);

        return () => clearInterval(timer);
    }, [timestamp, interval]);

    return relativeTime;
};

export default useRelativeTime;