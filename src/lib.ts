import Cron from 'croner'

export class Queue {
  head: Job
  timeout = null

  /**
   * This method emits the jobs event, handles rescheduling if necessary
   * and schedules the next job
   * @param job
   */
  private _invoke(job: Job) {
    console.log(job.event) // invoking functionality
    this.insert(job.nextInvocation())
    if (job.next) {
      this._schedule(job.next)
    } else {
      console.log('all done')
    }
    this.remove(job.timestamp)
  }

  /**
   * This method interacts the withe timeout, clearing and setting it.
   * @param job
   */
  private _schedule(job: Job) {
    clearTimeout(this.timeout)
    this.timeout = setTimeout(
      this._invoke.bind(this, job),
      job.timestamp - Date.now()
    )
  }

  insert(job: Job) {
    if (!job) return
    if (!this.head) {
      this.head = job
      this._schedule(job)
    } else if (job.timestamp < this.head.timestamp) {
      job.next = this.head
      this.head = job
      this._schedule(job)
    } else {
      let prev = this.head
      let curr = this.head.next
      while (curr && curr.timestamp < job.timestamp) {
        prev = curr
        curr = curr.next
      }
      prev.next = job
      job.next = curr
    }
  }

  remove(timestamp: number) {
    if (timestamp < this.head.timestamp || timestamp < 0) {
      throw new Error('out of bounds')
    } else if (timestamp === this.head.timestamp) {
      this.head = this.head.next
    } else {
      let prev = this.head
      let curr = this.head.next
      while (curr) {
        if (curr.timestamp === timestamp) {
          prev.next = curr.next
        }
        prev = curr
        curr = curr.next
      }
    }
  }

  *values() {
    let curr = this.head
    while (curr) {
      yield curr
      curr = curr.next
    }
  }
}

abstract class Job {
  event: string
  timestamp: number = 0
  next: Job = null

  constructor(event: string, timestamp: number) {
    this.event = event
    this.timestamp = timestamp
  }

  abstract nextInvocation(): Job | null
}

export class TimeoutJob extends Job {
  constructor(event: string, timeout: number | Date) {
    if (typeof timeout === 'number') {
      super(event, timeout + Date.now())
    } else {
      super(event, timeout.getTime() + Date.now())
    }
  }

  nextInvocation() {
    return null
  }
}

export class IntervalJob extends Job {
  interval: number
  constructor(event: string, interval: number) {
    super(event, Date.now() + interval)
    this.interval = interval
  }

  nextInvocation() {
    return new IntervalJob(this.event, this.interval)
  }
}

export class CronJob extends Job {
  cron: Cron

  constructor(event: string, cron: Cron) {
    super(event, Date.now() + cron.msToNext())
    this.cron = cron
  }

  nextInvocation() {
    return new CronJob(this.event, this.cron)
  }
}
