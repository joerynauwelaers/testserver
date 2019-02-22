var express = require("express");
var server = express();
const prometheusClient = require('prom-client');
const counter = new prometheusClient.Counter({ name: 'server', help: 'peekaboo' })
const responseTimes = new prometheusClient.Histogram(
    {
        name: 'responseTimes',
        help: 'measure random response times from API',
        labelNames: [
            'route', 'responsetime'
        ],
        buckets: [0.1, 5, 50, 100, 200, 300, 400, 500]
    }
)
var port = '80'

server.use(logResponseTime);

//use: covers any use of the API
//this means that any of the below defined get's will be executed after the use, so in this case, all api replies get a ranom delay between 100 and 500 miliseconds
server.use((req, res, next) => {
    setTimeout(next, getRandomArbitrary(100, 500));
});

server.get("/men", (req, res, next) => {
    res.json(["are", "so", "awesome"]);
});

server.get("/woman", (req, res, next) => {
    res.json(["are", "so", "awefull"]);
});

server.get("/metrics", (req, res, next) => {
    res.end(prometheusClient.register.metrics());
});

server.listen(port, () => {
    console.log('Server running on port', port);
});

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function logResponseTime(req, res, next) {
    const startHrTime = process.hrtime();
    counter.inc();
    res.on("finish", () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
        console.log("%s : %fms", req.path, elapsedTimeInMs);
        responseTimes.labels(req.path, elapsedTimeInMs).observe(elapsedTimeInMs);
    });

    next();
}