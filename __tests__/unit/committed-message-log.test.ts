import {CommitHash} from '../../src/commit-hash'
import {CommitInfo} from '../../src/commit-info'
import {CommittedMessage} from '../../src/committed-message'
import {CommittedMessageLog} from '../../src/committed-message-log'
import {DefaultLogFields} from 'simple-git'

function dummyNewJobCommitSubjectText(): string {
  return '📝🈺: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
}

describe('CommittedMessageLog', () => {
  it('should be instantiate from an array of commits (DefaultLogFields)', async () => {
    const commit: DefaultLogFields = {
      hash: 'not relevant',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const committedMessageLog = CommittedMessageLog.fromGitLogCommits([commit])

    expect(committedMessageLog).toBeInstanceOf(CommittedMessageLog)
  })

  it('should return the committed messages', async () => {
    const commit: DefaultLogFields = {
      hash: 'not relevant',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const committedMessageLog = CommittedMessageLog.fromGitLogCommits([commit])

    const expectedMessage = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    expect(committedMessageLog.getMessages()).toStrictEqual([expectedMessage])
  })

  it('could be empty', async () => {
    const committedMessageLog = CommittedMessageLog.fromGitLogCommits([])

    expect(committedMessageLog.isEmpty()).toBe(true)
  })

  it('should return the latest committed message', async () => {
    const commit1: DefaultLogFields = {
      hash: 'f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const commit2: DefaultLogFields = {
      hash: '2ab1cce1479d25966e2dba5be89849a71264a192',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const committedMessageLog = CommittedMessageLog.fromGitLogCommits([
      commit1,
      commit2
    ])

    const expectedMessage = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit1)
    )

    expect(
      committedMessageLog.getLatestMessage().equalsTo(expectedMessage)
    ).toBe(true)
  })

  it('should return the null message as the latest message when it is empty', async () => {
    const committedMessageLog = CommittedMessageLog.fromGitLogCommits([])

    expect(committedMessageLog.getLatestMessage().isNull()).toBe(true)
  })

  it('should find a message by commit hash', async () => {
    const commit: DefaultLogFields = {
      hash: 'f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const committedMessageLog = CommittedMessageLog.fromGitLogCommits([commit])

    const expectedMessage = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    expect(
      committedMessageLog
        .findByCommit(
          new CommitHash('f1a69d48a01cc130a64aeac5eaf762e4ba685de7')
        )
        .equalsTo(expectedMessage)
    ).toBe(true)
  })

  it('should return a null message if it can not find a message by its commit hash', async () => {
    const commit: DefaultLogFields = {
      hash: 'f1a69d48a01cc130a64aeac5eaf762e4ba685de7',
      date: 'not relevant',
      message: dummyNewJobCommitSubjectText(),
      refs: 'not relevant',
      body: 'not relevant',
      author_name: 'not relevant',
      author_email: 'not relevant'
    }

    const committedMessageLog = CommittedMessageLog.fromGitLogCommits([commit])

    expect(
      committedMessageLog
        .findByCommit(
          new CommitHash('2ab1cce1479d25966e2dba5be89849a71264a192')
        )
        .isNull()
    ).toBe(true)
  })
})
