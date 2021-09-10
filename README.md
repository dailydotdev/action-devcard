# GitHub Action for fetching the devcard from [daily.dev](https://api.daily.dev/get?r=omBratteng)

[![GitHub](https://img.shields.io/github/license/dailydotdev/action-devcard)](LICENSE)

## Example usasge

```yaml
- name: devcard
  uses: dailydotdev/action-devcard@2.0.2
  with:
    devcard_id: ${{ secrets.DEVCARD_ID }}
```

## Action options

### Required

- `devcard_id`: this is the unique hash of the devcard, it can be found in the URL of the devcard.
  - e.g. `https://api.daily.dev/devcards/0b156485612243bfa39092f30071e276.png` where the devcard_id is `0b156485612243bfa39092f30071e276`
  - Can be found at [https://app.daily.dev/devcard](https://app.daily.dev/devcard)

### Optional

- `devcard_id`: GitHub Token used to commit the devcard
- `commit_branch`: The branch to commit the devcard to. Defaults to the branch of the action.
- `commit_message`: The commit message to use when committing the devcard. Defaults to `Update ${filename}`.
  - You can use `${filename}` in the message to refer to the filename of the devcard.
- `commit_filename`: The filename to commit the devcard to. Defaults to `devcard.svg`.
  - If you want to save the devcard as a PNG, you can use `devcard.png` instead, or any other filename ending in `.png`.
- `dryrun`: If set to `true`, the action will run as normal, but not actually commit the devcard

## Advanced usage

This will save the devcard as PNG and commit to a separate branch named `devcard`.

```yaml
- name: devcard
   uses: dailydotdev/action-devcard@2.0.2
   with:
     devcard_id: ${{ secrets.DEVCARD_ID }}
     commit_branch: devcard
     commit_filename: devcard.png
     commit_message: "chore: update ${filename}"
```
