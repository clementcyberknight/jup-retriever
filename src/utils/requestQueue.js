class RequestQueue {
    constructor(intervalMs = 1000) {
        this.queue = [];
        this.intervalMs = intervalMs;
        this.isProcessing = false;
        this.lastProcessedTime = 0;
    }

    add(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.isProcessing) return;

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const now = Date.now();
            const timeSinceLast = now - this.lastProcessedTime;
            const timeToWait = Math.max(0, this.intervalMs - timeSinceLast);

            if (timeToWait > 0) {
                await new Promise((resolve) => setTimeout(resolve, timeToWait));
            }

            const { task, resolve, reject } = this.queue.shift();
            this.lastProcessedTime = Date.now();

            try {
                const result = await task();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        }

        this.isProcessing = false;
    }

    getQueueLength() {
        return this.queue.length;
    }

    getStats() {
        return {
            queueLength: this.queue.length,
            isProcessing: this.isProcessing
        };
    }
}

const requestQueue = new RequestQueue(10000);

module.exports = requestQueue;

