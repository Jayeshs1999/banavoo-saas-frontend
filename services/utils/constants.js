const headerContentWithAuthorization = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
}

export const customHeaders = token => {
    let copiedHeaderContentWithAuthorization = {
        ...headerContentWithAuthorization
    }
    copiedHeaderContentWithAuthorization['Authorization'] = `Bearer ${token}`
    return { headers: copiedHeaderContentWithAuthorization }
}