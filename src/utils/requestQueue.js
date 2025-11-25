class RequestQueue {
    constructor(intervalMs = 1000) {
        this.queue = [];
        this.intervalMs = intervalMs;
        this.isProcessing = false;
        this.lastProcessedTime = 0;
    }

    /**
     * Adds a task to the queue.
     * @param {Function} task - A function that returns a promise (or value).
     * @returns {Promise} - Resolves with the task's result.
     */
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
}

// Export a singleton instance for the application
const requestQueue = new RequestQueue(1000);

module.exports = requestQueue;

