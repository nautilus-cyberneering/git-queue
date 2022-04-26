import {CommitHash} from '../../src/commit-hash'
import {CommitSubjectParser} from '../../src/commit-subject-parser'

describe('CommitSubjectParser', () => {
  it('should parse the message key from a commit subject', () => {
    const parser = new CommitSubjectParser(
      '📝🈺: queue-name: job.id.1 job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )

    expect(parser.getMessageKey().toString()).toBe('🈺')
  })

  it('should fail when the message key is missing in a commit subject', () => {
    const fn = (): string => {
      const parser = new CommitSubjectParser(
        '📝: queue-name: job.id.1 job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
      )
      return parser.getMessageKey().toString()
    }

    expect(fn).toThrowError()
  })

  it('should parse the queue name from a commit subject', () => {
    const parser = new CommitSubjectParser(
      '📝🈺: queue-name: job.id.1 job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )

    expect(parser.getQueueName().toString()).toBe('queue-name')
  })

  it('should fail when the queue name is missing in a commit subject', () => {
    const fn = (): string => {
      const parser = new CommitSubjectParser(
        '📝🈺: : job.id.1 job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
      )
      return parser.getQueueName().toString()
    }

    expect(fn).toThrowError()
  })

  it('should parse the job reference (commit hash) from a commit subject', () => {
    const parser = new CommitSubjectParser(
      '📝🈺: queue-name: job.id.1 job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )

    expect(parser.getJobRef().toString()).toBe(
      'f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )
  })

  it('should allow to omit the optional job reference', () => {
    const parser = new CommitSubjectParser('📝🈺: queue-name')

    expect(parser.getMessageKey().toString()).toBe('🈺')
    expect(parser.getQueueName().toString()).toBe('queue-name')
  })

  it('should fail when the job reference prefix exists but the reference value is invalid in a commit subject', () => {
    const fn = (): string => {
      const parser = new CommitSubjectParser(
        '📝🈺: queue-name: job.id.1 job.ref.f1a69d48a01cc---af762e4ba685de7'
      )
      return parser.getJobRef().toString()
    }

    expect(fn).toThrowError()
  })

  it('should fail when the job reference prefix exists but the reference value is missing in a commit subject', () => {
    const fn = (): string => {
      const parser = new CommitSubjectParser(
        '📝🈺: queue-name: job.id.1 job.ref.'
      )
      return parser.getJobRef().toString()
    }

    expect(fn).toThrowError()
  })

  it('should return a Null Commit when the job reference does not exist', () => {
    const parser = new CommitSubjectParser('📝🈺: queue-name: job.id.1 ')
    const jobRef = parser.getJobRef()

    expect(jobRef).toBeInstanceOf(CommitHash)
    expect(jobRef.isNull()).toBe(true)
  })

  it('should fail when the job Id does not exist', () => {
    const fn = (): number => {
      const parser = new CommitSubjectParser(
        '📝🈺: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
      )
      return parser.getJobId()
    }

    expect(fn).toThrowError()
  })

  it('should parse the job id from a commit subject', () => {
    const parser = new CommitSubjectParser(
      '📝🈺: queue-name: job.id.42 job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )

    expect(parser.getJobId().toString()).toBe('42')
  })

  it('should parse the job id from a commit subject when there is no job ref', () => {
    const parser = new CommitSubjectParser('📝🈺: queue-name: job.id.42')

    expect(parser.getJobId().toString()).toBe('42')
  })
})
