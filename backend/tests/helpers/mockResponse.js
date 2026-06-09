function createMockResponse() {
    const res = {};

    res.statusCode = 200;
    res.body = undefined;

    res.status = jest.fn((code) => {
        res.statusCode = code;
        return res;
    });


    res.json = jest.fn((payload) => {
        res.body = payload;
        return res;
    });

    res.send = jest.fn((payload) => {
        res.body = payload;
        return res;
    });

    return res;
}

module.exports = { createMockResponse };
