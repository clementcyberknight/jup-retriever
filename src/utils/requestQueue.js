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
}

class PerIPRequestQueue {
    constructor(intervalMs = 1000) {
        this.queues = new Map();
        this.intervalMs = intervalMs;
    }

    add(ip, task) {
        if (!this.queues.has(ip)) {
            this.queues.set(ip, new RequestQueue(this.intervalMs));
        }
        return this.queues.get(ip).add(task);
    }

    getQueueStats(ip) {
        const queue = this.queues.get(ip);
        if (!queue) return { queueLength: 0, isProcessing: false };
        return {
            queueLength: queue.queue.length,
            isProcessing: queue.isProcessing
        };
    }

    getAllStats() {
        const stats = {};
        for (const [ip, queue] of this.queues.entries()) {
            stats[ip] = {
                queueLength: queue.queue.length,
                isProcessing: queue.isProcessing
            };
        }
        return stats;
    }
}

const perIPRequestQueue = new PerIPRequestQueue(1000);

module.exports = perIPRequestQueue;

