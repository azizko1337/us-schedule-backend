function notFoundRoute(req, res) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Endpoint not found. Wrong URL.');
}

export default notFoundRoute;