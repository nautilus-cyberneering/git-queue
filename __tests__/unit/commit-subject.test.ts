import {CommitSubject} from '../../src/commit-subject'

function dummyCommitSubjectText(): string {
  return '📝🈺: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
}

describe('CommitSubject', () => {
  it('should contain a text', () => {
    const commitSubject = new CommitSubject('text')

    expect(commitSubject.text).toBe('text')
  })

  it('should know if a given commit subject belongs to a queue', () => {
    const commit = new CommitSubject(dummyCommitSubjectText())
    expect(commit.belongsToQueue('queue-name')).toBe(true)
    expect(commit.belongsToQueue('queue-name-2')).toBe(false)

    const commit2 = new CommitSubject(
      '📝🈺: Library Update [library-aaa]: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )
    expect(commit2.belongsToQueue('Library Update [library-aaa]')).toBe(true)

    const commit3 = new CommitSubject(
      'standard commit: - this is not a queue commit - missing prefix'
    )
    expect(commit3.belongsToQueue('standard commit')).toBe(false)
  })

  it('should compare two subjects', () => {
    const subject1 = new CommitSubject('1')
    const subject2 = new CommitSubject('1')
    expect(subject1.equalsTo(subject2)).toBe(true)

    const subject3 = new CommitSubject('1')
    const subject4 = new CommitSubject('2')
    expect(subject3.equalsTo(subject4)).toBe(false)
  })

  it('should cast to string', () => {
    const subject = new CommitSubject('1')
    expect(subject.toString()).toBe('1')
  })

  it('should allow to include a message key', () => {
    const subject = new CommitSubject(dummyCommitSubjectText())
    expect(subject.getMessageKey()).toBe('🈺')
  })

  it('should allow to include a reference to another job by using the commit hash', () => {
    const subject = new CommitSubject(dummyCommitSubjectText())
    expect(subject.getJobRef()).toBe('f1a69d48a01cc130a64aeac5eaf762e4ba685de7')
  })

  it('should allow to include the queue name', () => {
    const subject = new CommitSubject(dummyCommitSubjectText())
    expect(subject.getQueueName()).toBe('queue-name')
  })
})
