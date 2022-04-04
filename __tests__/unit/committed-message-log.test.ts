import {CommitHash} from '../../src/commit-hash'
import {CommitInfo} from '../../src/commit-info'
import {CommittedMessage} from '../../src/committed-message'
import {CommittedMessageLog} from '../../src/committed-message-log'
import {DefaultLogFields} from 'simple-git'

function dummyNewJobCommitSubjectText(): string {
  return '📝🈺: queue-name: job.id.1 job.ref.f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
}

function dummySimpleGitCommit(
  hash = 'f1c69d48a01cc130a64aeac5fff762e4bf685de7'
): DefaultLogFields {
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

  describe('should return the latest committed message, returning ...', () => {
    it('the null committed message when the git log is empty', async () => {
      const committedMessageLog = CommittedMessageLog.fromGitLogCommits([])

      expect(committedMessageLog.getLatestMessage().isNull()).toBe(true)
    })

    it('the latest committed message in any other case', async () => {
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
  })

  describe('should return the next to the latest committed message, returning ...', () => {
    it('the committed message if there are two or more commits', async () => {
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
        CommitInfo.fromDefaultLogFields(commit2)
      )

      expect(
        committedMessageLog.getNextToLatestMessage().equalsTo(expectedMessage)
      ).toBe(true)
    })

    it('the null committed message in any other case', async () => {
      const committedMessageLog = CommittedMessageLog.fromGitLogCommits([])

      expect(committedMessageLog.getNextToLatestMessage().isNull()).toBe(true)
    })
  })

  it('should find a message by a full 40-character commit hash', async () => {
    const commit = dummySimpleGitCommitWithHash(
      'f1a69d48a01cc130a64aeac5eaf762e4ba685de7'
    )

    const committedMessageLog = CommittedMessageLog.fromGitLogCommits([commit])

    const expectedMessage = CommittedMessage.fromCommitInfo(
      CommitInfo.fromDefaultLogFields(commit)
    )

    expect(
      committedMessageLog
        .findByCommitHash(
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
        .findByCommitHash(
          new CommitHash('2ab1cce1479d25966e2dba5be89849a71264a192')
        )
        .isNull()
    ).toBe(true)
  })
})
