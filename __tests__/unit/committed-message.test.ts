import {
  CommittedMessage,
  JobFinishedCommittedMessage,
  NewJobCommittedMessage,
  nullMessage
} from '../../src/committed-message'
import {CommitHash} from '../../src/commit-hash'
import {CommitInfo} from '../../src/commit-info'
import {DefaultLogFields} from 'simple-git'

describe('Queue', () => {
  it('should build a new-job message from a commit', async () => {
    const commit: DefaultLogFields = {
      hash: 'not relevant',
      date: 'not relevant',
      message: '📝🈺: ',
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

  it('should return the hash of the commit where the message was stored', async () => {
    const commit: DefaultLogFields = {
      hash: '8324b0720e4312e0a933a74e840bc2f042999452',
      date: 'not relevant',
      message: '📝🈺: ',
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
      hash: 'not relevant',
      date: 'not relevant',
      message: '📝✅: ',
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
      hash: 'not relevant',
      date: 'not relevant',
      message: '📝✅: ',
      refs: 'not relevant',
      body: '--PAYLOAD--',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const message = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    expect(message.payload()).toBe('--PAYLOAD--')
  })

  it('should trim the payload', async () => {
    const commit: DefaultLogFields = {
      hash: 'not relevant',
      date: 'not relevant',
      message: '📝✅: ',
      refs: 'not relevant',
      body: '  --PAYLOAD--  ',
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

    expect(message.isEmpty()).toBe(true)
  })

  it('should throw an error when trying to build a message from a no-queue commit', async () => {
    const fn = (): CommittedMessage => {
      const commit: DefaultLogFields = {
        hash: 'not relevant',
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
})
