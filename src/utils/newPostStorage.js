const KEY = 'has_new_post';

export const setHasNewPost = () => {
    localStorage.setItem(KEY, 'true');
    window.dispatchEvent(new Event('new-post'));
};

export const clearNewPost = () => {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event('new-post'));
};

export const hasNewPost = () => {
    return localStorage.getItem(KEY) === 'true';
};
