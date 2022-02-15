import {CommitHash} from '../../src/commit-hash'
import {CommitInfo} from '../../src/commit-info'
import {CommittedMessage} from '../../src/committed-message'
import {CommittedMessageLog} from '../../src/committed-message-log'
import {DefaultLogFields} from 'simple-git'

function dummyNewJobCommitSubjectText(): string {
  return '📝🈺: queue-name: job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
}

function dummySimpleGitCommit(hash = 'not relevant'): DefaultLogFields {
  return {
    hash,
    date: 'not relevant',
    message: dummyNewJobCommitSubjectText(),
    refs: 'not relevant',
    body: 'not relevant',
    author_name: 'not relevant',
    author_email: 'not relevant'
  }
}

function dummySimpleGitCommitWithHash(hash: string): DefaultLogFields {
  return {
    hash,
    date: 'not relevant',
    message: dummyNewJobCommitSubjectText(),
    refs: 'not relevant',
    body: 'not relevant',
    author_name: 'not relevant',
    author_email: 'not relevant'
  }
}

describe('CommittedMessageLog', () => {
  it('should be instantiate from an array of commits (DefaultLogFields)', async () => {
    const committedMessageLog = CommittedMessageLog.fromGitLogCommits([
      dummySimpleGitCommit()
    ])

    expect(committedMessageLog).toBeInstanceOf(CommittedMessageLog)
  })

  it('should return the committed messages', async () => {
    const commit = dummySimpleGitCommit()

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
    const commit1 = dummySimpleGitCommitWithHash(
      'f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )
    const commit2 = dummySimpleGitCommitWithHash(
      '2ab1cce1479d25966e2dba5be89849a71264a192'
    )

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
    const commit = dummySimpleGitCommitWithHash(
      'f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )

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
    const commit = dummySimpleGitCommitWithHash(
      'f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )

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
