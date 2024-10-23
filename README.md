# GitHub Action for fetching the devcard from [daily.dev](https://api.daily.dev/get?r=omBratteng)

[![GitHub](https://img.shields.io/github/license/dailydotdev/action-devcard)](LICENSE)
[![GitHub Workflow Status (event)](https://img.shields.io/github/workflow/status/dailydotdev/action-devcard/continuous-integration?event=push&label=continuous-integration&logo=github)](https://github.com/dailydotdev/action-devcard/actions/workflows/continuous-integration.yml)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/dailydotdev/action-devcard?logo=github)](https://github.com/dailydotdev/action-devcard/releases/latest)

## Example usage

```yaml
jobs:
  devcard:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: devcard
        uses: dailydotdev/action-devcard@3.2.0
        with:
          user_id: ${{ secrets.USER_ID }}
```

## Action options

### Required

- `user_id`: this is the unique id of the devcard, it can be found in the URL of the devcard or [here](https://app.daily.dev/api/id).
  - e.g. `https://api.daily.dev/devcards/v2/0b156485612243bfa39093.2.071e276.png` where the user_id is `0b156485612243bfa39093.2.071e276`
  - Can be found at [https://app.daily.dev/api/id](https://app.daily.dev/api/id)

### Optional

- `type`: Configure orientation for devcard
  - `default`: Vertical (Default)
  - `wide`: Horizontal
- `token`: GitHub Token used to commit the devcard
- `commit_branch`: The branch to commit the devcard to. Defaults to the branch of the action.
- `commit_message`: The commit message to use when committing the devcard. Defaults to `Update ${filename}`.
  - You can use `${filename}` in the message to refer to the filename of the devcard.
- `commit_filename`: The filename to commit the devcard to. Defaults to `devcard.png`.
  - You can also use any other filename ending in `.png`.
- `committer_email`: The committer email used in commit. Defaults to `noreply@github.com`.
- `committer_name`: The committer name used in commit. Defaults to `github-actions[bot]`.
- `dryrun`: If set to `true`, the action will run as normal, but not actually commit the devcard

## Advanced usage

This will save the devcard as PNG and commit to a separate branch named `devcard`.

```yaml
jobs:
  devcard:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: devcard
        uses: dailydotdev/action-devcard@3.2.0
        with:
          user_id: ${{ secrets.USER_ID }}
          commit_branch: devcard
          commit_filename: devcard.png
          commit_message: "chore: update ${filename}"
```

## Keep up-to-date with GitHub Dependabot

Since [Dependabot](https://docs.github.com/en/github/administering-a-repository/keeping-your-actions-up-to-date-with-github-dependabot)
has [native GitHub Actions support](https://docs.github.com/en/github/administering-a-repository/configuration-options-for-dependency-updates#package-ecosystem),
to enable it on your GitHub repo all you need to do is add the `.github/dependabot.yml` file:

```yaml
version: 2
updates:
  # Maintain dependencies for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "daily"
```
