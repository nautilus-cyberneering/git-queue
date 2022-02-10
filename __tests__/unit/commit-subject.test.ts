import {CommitSubject} from '../../src/commit-subject'

describe('CommitSubject', () => {
  it('should contain a text', () => {
    const commitSubject = new CommitSubject('text')

    expect(commitSubject.text).toBe('text')
  })

  it('should know if a given subject belongs to a queue', () => {
    const commitThatBelongs = new CommitSubject('...QUEUE_NAME')
    expect(commitThatBelongs.belongsToQueue('QUEUE_NAME')).toBe(true)

    const commitThatDoesNotBelong = new CommitSubject(
      'QUEUE_NAME IS NOT THE LAST PART OF THE SUBJECT'
    )
    expect(commitThatDoesNotBelong.belongsToQueue('QUEUE_NAME')).toBe(false)
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

  it('should extract the message key', () => {
    const subject = new CommitSubject('📝🈺: NOT RELEVANT')
    expect(subject.getMessageKey()).toBe('🈺')
  })
})
