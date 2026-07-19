const QUEUE_KEY = 'peeQueue';

export const loadQueue = () => {
    try {
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY));
        return Array.isArray(queue) ? queue : [];
    } catch {
        return [];
    }
};

const saveQueue = (queue) => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const enqueue = (time) => {
    const entry = {
        _id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        time,
        pending: true,
    };
    saveQueue([...loadQueue(), entry]);
    return entry;
};

export const removeFromQueue = (id) => {
    saveQueue(loadQueue().filter((entry) => entry._id !== id));
};

export const isLocalId = (id) => typeof id === 'string' && id.startsWith('local-');
