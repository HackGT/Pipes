
export const UPDATE_SERVICE = 'UPDATE_SERVICE';
export const updateService = (service: string, waiting: boolean) => ({
    type: UPDATE_SERVICE,
    payload: {
        service,
        waiting
    }
});
export async function throwErrors(res: any) {
    if (res.ok)
        return res.json();
    const error = await res.json();
    if (error.message)
        throw error.message;
    if (error.status === 404)
        throw '404 item not found';
}