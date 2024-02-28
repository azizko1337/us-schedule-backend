function parseParams(url){
    const params = {}

    url = url.split('?')[1];
    url = url.split('&');
    url.forEach(param => {
        const keyValue = param.split('=');
        params[keyValue[0]] = keyValue[1];
    });

    return params;
}

export default parseParams;