import {CommitHash} from '../../src/commit-hash'
import {CommitInfo} from '../../src/commit-info'
import {Job} from '../../src/job'
import {NewJobCommittedMessage} from '../../src/committed-message'
import {dummyCommitBodyText} from '../../src/__tests__/helpers'

describe('Job', () => {
  it('should contain a payload', () => {
    const job = new Job(
      'payload',
      new CommitHash('a362802b98c78df052a78796a1a7cde60a5c1faf')
    )

    expect(job.getPayload()).toBe('payload')
  })

  it('should contain a commit has where the job was created', () => {
    const commitHash = new CommitHash(
      'a362802b98c78df052a78796a1a7cde60a5c1faf'
    )
    const job = new Job('payload', commitHash)

    expect(job.getCommitHash()).toBe(commitHash)
  })

  it('should be nullable', () => {
    const job = new Job(
      'payload',
      new CommitHash('a362802b98c78df052a78796a1a7cde60a5c1faf')
    )

    expect(job.getPayload()).toBe('payload')
  })

  it('should compare two jobs', () => {
    const job1 = new Job(
      'payload',
      new CommitHash('a362802b98c78df052a78796a1a7cde60a5c1faf')
    )

    const job2 = new Job(
      'payload',
      new CommitHash('8f51fa0a019b277103acc5ef75c52dfb2a9bcce3')
    )

    const job3 = new Job(
      'payload3',
      new CommitHash('a362802b98c78df052a78796a1a7cde60a5c1faf')
    )

    expect(job1.equalsTo(job1)).toBe(true)
    expect(job1.equalsTo(job2)).toBe(false)
    expect(job1.equalsTo(job3)).toBe(false)
  })

  it('should be instantiable from a new job committed message', () => {
    const commitInfo = new CommitInfo(
      new CommitHash('ad5cea6308f69d7955d8de5f0da19f675d5ba75f'),
      'date',
      'message',
      'refs',
      dummyCommitBodyText(),
      'author name',
      'author email'
    )

    const newJobCommittedMessage = new NewJobCommittedMessage(commitInfo)

    const job = Job.fromCommittedMessage(newJobCommittedMessage)

    expect(job.getPayload()).toBe('test')
    expect(
      job
        .getCommitHash()
        .equalsTo(new CommitHash('ad5cea6308f69d7955d8de5f0da19f675d5ba75f'))
    ).toBe(true)
  })
})
