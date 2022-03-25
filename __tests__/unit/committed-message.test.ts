import {
  CommittedMessage,
  JobFinishedCommittedMessage,
  NewJobCommittedMessage,
  nullMessage
} from '../../src/committed-message'
import {CommitHash} from '../../src/commit-hash'
import {CommitInfo} from '../../src/commit-info'
import {DefaultLogFields} from 'simple-git'
import {dummyCommitBodyText} from '../../src/__tests__/helpers'

function dummyNewJobCommitSubjectText(): string {
  return '📝🈺: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
}

function dummyJobFinishedCommitSubjectText(): string {
  return '📝✅: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
}

describe('Queue', () => {
  it('should build a new-job message from a commit', async () => {
    const commit: DefaultLogFields = {
      hash: 'f1b69d48a01cc13ccc4aeac5eaf762e4ba685de7',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const message = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    expect(message).toBeInstanceOf(NewJobCommittedMessage)
  })

  it('should return the commit info', async () => {
    const commit: DefaultLogFields = {
      hash: 'f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const message = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    const expectedCommitInfo = new CommitInfo(
      new CommitHash('f1a69d48a01cc130a64aeac5eaf762e4ba685de7'),
      'not relevant',
      dummyNewJobCommitSubjectText(),
      'not relevant',
      'not relevant',
      'not relevant',
      'not relevant'
    )

    expect(message.commitInfo().equalsTo(expectedCommitInfo)).toBe(true)
  })

  it('should return the hash of the commit where the message was stored', async () => {
    const commit: DefaultLogFields = {
      hash: '8324b0720e4312e0a933a74e840bc2f042999452',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const message = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    expect(
      message
        .commitHash()
        .equalsTo(new CommitHash('8324b0720e4312e0a933a74e840bc2f042999452'))
    ).toBe(true)
  })

  it('should build a finished-job message from a commit', async () => {
    const commit: DefaultLogFields = {
      hash: 'f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
      date: 'not relevant',
      message: dummyJobFinishedCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const message = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    expect(message).toBeInstanceOf(JobFinishedCommittedMessage)
  })

  it('should parse the payload from the commit body', async () => {
    const commit: DefaultLogFields = {
      hash: 'f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: dummyCommitBodyText(),
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const message = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    expect(message.payload()).toBe('test')
  })

  it('should trim the payload', async () => {
    const bodyText = JSON.stringify({
      namespace: 'git-queue.commit-body',
      version: 1,
      payload: '   --PAYLOAD--   ',
      metadata: {
        job_number: 1,
        job_commit: 'abc'
      }
    })

    const commit: DefaultLogFields = {
      hash: 'f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: bodyText,
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const message = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    expect(message.payload()).toBe('--PAYLOAD--')
  })

  it('should have an special empty message which represents NO message', async () => {
    const message = nullMessage()

    expect(message.isNull()).toBe(true)
  })

  it('should throw an error when trying to build a message from a no-queue commit', async () => {
    const fn = (): CommittedMessage => {
      const commit: DefaultLogFields = {
        hash: 'f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
        date: 'not relevant',
        message: 'NO VALID COMMIT SUBJECT',
        refs: 'not relevant',
        body: 'not relevant',
        author_name: 'not relevant',
        author_email: 'not relevant'
      }

      return CommittedMessage.fromCommitInfo(
        CommitInfo.fromDefaultLogFields(commit)
      )
    }

    expect(fn).toThrow(Error)
  })

  it('should throw an error when trying to build a message with an invalid message key', async () => {
    const fn = (): CommittedMessage => {
      const commit: DefaultLogFields = {
        hash: 'f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
        date: 'not relevant',
        message:
          '📝INVALID: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
        refs: 'not relevant',
        body: 'not relevant',
        author_name: 'not relevant',
        author_email: 'not relevant'
      }

      return CommittedMessage.fromCommitInfo(
        CommitInfo.fromDefaultLogFields(commit)
      )
    }

    expect(fn).toThrow(Error)
  })
})
