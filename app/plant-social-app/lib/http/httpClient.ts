/*
* HTTP client wrapper around Fetch
*
* Automatically strigifies rquest bodies
* Parses respones as JSON and returns typed results
* 
* @template T is the expected response
* 
* @example
* interface User{
*   name:string;
*   email:string;
* }
* const user = await httpClient.get<User>("url");
* 
*/
async function request<T>(url: string, options: RequestInit): Promise<T> {
    const is_Get = options.method?.toUpperCase() === 'GET';
    const is_Delete = options.method?.toUpperCase() === 'DELETE';
    const res = await fetch(url, {
        ...options,
        headers: {
            ...(is_Get || is_Delete ? {} : { 'Content-Type': "application/json" }),
            ...(options.headers || {})

        }
    })
    const data = await res.json().catch(()=>({}));
    if (!res.ok){
        throw new Error(data.error||data.message||`HTTP error ${res.status}`)
    }
    return data as T;
}

const httpClient = {
    get: async function <T>(url: string) {
        return request<T>(url, { method: 'GET' });
    },
    post: async function <T>(url: string, body: unknown) {
        return request<T>(url, {
            method: 'POST',
            body: JSON.stringify(body)
        });

    },
    put: async function <T>(url: string, body: unknown) {
        return request<T>(url, {
            method: 'PUT',
            body: JSON.stringify(body)
        });

    },
    delete: async function <T>(url: string) {
        return request<T>(url, {
            method: 'DELETE',
        });
    },
    upload: async function <T>(url: string, formData: FormData): Promise<T> {
        const res = await fetch(url, {
            method: 'POST',
            body: formData,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            throw new Error(data.error || data.message || `HTTP error ${res.status}`);
        }
        return data as T;
    }
}
export default httpClient;