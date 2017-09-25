export const SHOW_ERROR = 'SHOW_ERROR';
export const DISMISS_ERROR = 'DISMISS_ERROR';

export const showErrorMessage = (message: string) => ({
    type: SHOW_ERROR,
    payload: message
});

export const dismissErrorMessage = () => ({
    type: DISMISS_ERROR
});