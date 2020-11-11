'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

class Queue {
    constructor() {
        this.timeout = null;
    }
    /**
     * This method emits the jobs event, handles rescheduling if necessary
     * and schedules the next job
     * @param job
     */
    _invoke(job) {
        console.log(job.event); // invoking functionality
        this.insert(job.nextInvocation());
        if (job.next) {
            this._schedule(job.next);
        }
        else {
            console.log('all done');
        }
        this.remove(job.timestamp);
    }
    /**
     * This method interacts the withe timeout, clearing and setting it.
     * @param job
     */
    _schedule(job) {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this._invoke.bind(this, job), job.timestamp - Date.now());
    }
    insert(job) {
        if (!job)
            return;
        if (!this.head) {
            this.head = job;
            this._schedule(job);
        }
        else if (job.timestamp < this.head.timestamp) {
            job.next = this.head;
            this.head = job;
            this._schedule(job);
        }
        else {
            let prev = this.head;
            let curr = this.head.next;
            while (curr && curr.timestamp < job.timestamp) {
                prev = curr;
                curr = curr.next;
            }
            prev.next = job;
            job.next = curr;
        }
    }
    remove(timestamp) {
        if (timestamp < this.head.timestamp || timestamp < 0) {
            throw new Error('out of bounds');
        }
        else if (timestamp === this.head.timestamp) {
            this.head = this.head.next;
        }
        else {
            let prev = this.head;
            let curr = this.head.next;
            while (curr) {
                if (curr.timestamp === timestamp) {
                    prev.next = curr.next;
                }
                prev = curr;
                curr = curr.next;
            }
        }
    }
    *values() {
        let curr = this.head;
        while (curr) {
            yield curr;
            curr = curr.next;
        }
    }
}
class Job {
    constructor(event, timestamp) {
        this.timestamp = 0;
        this.next = null;
        this.event = event;
        this.timestamp = timestamp;
    }
}
class TimeoutJob extends Job {
    constructor(event, timeout) {
        if (typeof timeout === 'number') {
            super(event, timeout + Date.now());
        }
        else {
            super(event, timeout.getTime() + Date.now());
        }
    }
    nextInvocation() {
        return null;
    }
}
class IntervalJob extends Job {
    constructor(event, interval) {
        super(event, Date.now() + interval);
        this.interval = interval;
    }
    nextInvocation() {
        return new IntervalJob(this.event, this.interval);
    }
}
class CronJob extends Job {
    constructor(event, cron) {
        super(event, Date.now() + cron.msToNext());
        this.cron = cron;
    }
    nextInvocation() {
        return new CronJob(this.event, this.cron);
    }
}

exports.CronJob = CronJob;
exports.IntervalJob = IntervalJob;
exports.Queue = Queue;
exports.TimeoutJob = TimeoutJob;
//# sourceMappingURL=index.js.map
