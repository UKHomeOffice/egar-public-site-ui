# Issue tracker: Jira

Jira is the source of truth for issues and specifications for this repo. Agents do not have access to Jira.

## Conventions

- **Refer to work**: Use Jira issue keys supplied by the user, for example `PROJ-123`.
- **Issue details**: Treat Jira descriptions, acceptance criteria, comments, and status supplied in the conversation as the available source material.
- **Jira operations**: Do not attempt to browse, read, create, edit, comment on, label, assign, or transition Jira issues.
- **GitHub relationship**: GitHub hosts the repository and pull requests; Jira remains the source of truth for work tracking.

## When a skill says "publish to the issue tracker"

Prepare the issue content in the response for the user to copy into Jira. Do not create or update the Jira issue.

## When a skill says "fetch the relevant ticket"

Ask the user to provide the Jira issue details or paste the relevant content. Do not attempt to access Jira.
