import {CommittedMessage, nullMessage} from './committed-message'
import {DefaultLogFields, ListLogLine} from 'simple-git'

import {CommitHash} from './commit-hash'
import {CommitInfo} from './commit-info'

/**
 * A readonly list of ordered commit messages.
 * A memory version of `git log` command containing only queue commits.
 */
export class CommittedMessageLog {
  private readonly messages: readonly CommittedMessage[]

  private constructor(messages: readonly CommittedMessage[]) {
    this.messages = messages
  }

  static fromGitLogCommits(
    commits: (DefaultLogFields & ListLogLine)[]
  ): CommittedMessageLog {
    const committedMessages = commits.map(commit =>
      CommittedMessage.fromCommitInfo(CommitInfo.fromDefaultLogFields(commit))
    )
    return new CommittedMessageLog(committedMessages)
  }

  getMessages(): readonly CommittedMessage[] {
    return this.messages
  }

  isEmpty(): boolean {
    return this.messages.length === 0
  }

  getLatestMessage(): CommittedMessage {
    return this.isEmpty() ? nullMessage() : this.messages[0]
  }

  findByCommit(commitHash: CommitHash): CommittedMessage {
    const commits = this.messages.filter(message =>
      message.commitHash().equalsTo(commitHash)
    )

    if (commits.length === 0) {
      return nullMessage()
    }

    return commits[0]
  }
}
