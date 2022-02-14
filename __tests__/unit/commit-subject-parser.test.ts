import {CommitSubjectParser} from '../../src/commit-subject-parser'

describe('CommitSubjectParser', () => {
  it('should parse the message key from a commit subject', () => {
    const parser = new CommitSubjectParser(
      '📝🈺: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )

    expect(parser.getMessageKey().toString()).toBe('🈺')
  })

  it('should parse the queue name from a commit subject', () => {
    const parser = new CommitSubjectParser(
      '📝🈺: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )

    expect(parser.getQueueName().toString()).toBe('queue-name')
  })

  it('should parse the job reference (commit hash) from a commit subject', () => {
    const parser = new CommitSubjectParser(
      '📝🈺: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
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
})
