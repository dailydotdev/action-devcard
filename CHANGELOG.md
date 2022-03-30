# Change Log

All notable changes to the "devcard" workflow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.6] - 2022-03-30

- chore: bump actions/setup-node from 2.5.0 to 2.5.1 ([#89](https://github.com/dailydotdev/action-devcard/pull/89))
- docs: fix spelling in `README.md` ([#91](https://github.com/dailydotdev/action-devcard/pull/91))
- chore: only run dependabot weekly
- chore(deps): bump dependencies

## [2.0.5] - 2021-12-17

- chore(deps): bump dependencies
- docs(readme): add section about using dependabot
- chore: bump node version in `.nvmrc`

## [2.0.4] - 2021-10-07

- docs(readme): fixes wrong option under optional

## [2.0.3] - 2021-10-04

- fix: workflows now passes correctly
- chore: updated dependencies
- chore: upgrade to node v16.10

## [2.0.2] - 2021-09-11

- feat: use workflow matrix to test local action
- chore: remove old `test-local-action.yml` workflow
- feat: create auto release

## [2.0.1] - 2021-09-10

- bumped dependencies
- added `ref` to devcard URL for analytics purposes

## [2.0.0] - 2021-09-07

- released under @dailydotdev
- bumped dependencies

## [1.2.0] - 2021-08-25

- docs: fix the `Unreleased` link
- chore: setup CI
- build(deps-dev): bump @typescript-eslint/parser from 4.29.2 to 4.29.3
- chore(deps-dev): bump @typescript-eslint/eslint-plugin from 4.29.2 to 4.29.3
- chore: rename `prepare` to `lint-build`
- feat: add cache invalidator to the image URL closes #3
- fix: rename `hash` to `devcard_id` closes #1
- feat: add uuid validation of the devcard ID

## [1.1.1] - 2021-08-22

- docs: more comprehensive `README`

## [1.1.0] - 2021-08-22

- fix: use the correct format for running docker image
- chore: add dependabot for npm dependencies

## [1.0.0] - 2021-08-22

- Initial release [`1854869`](https://github.com/dailydotdev/action-devcard/commit/1854869)

[Unreleased]: https://github.com/dailydotdev/action-devcard/compare/2.0.6...HEAD
[2.0.6]: https://github.com/dailydotdev/action-devcard/compare/2.0.5...2.0.7
[2.0.5]: https://github.com/dailydotdev/action-devcard/compare/2.0.4...2.0.5
[2.0.4]: https://github.com/dailydotdev/action-devcard/compare/2.0.3...2.0.4
[2.0.3]: https://github.com/dailydotdev/action-devcard/compare/2.0.2...2.0.3
[2.0.2]: https://github.com/dailydotdev/action-devcard/compare/2.0.1...2.0.2
[2.0.1]: https://github.com/dailydotdev/action-devcard/compare/2.0.0...2.0.1
[2.0.0]: https://github.com/dailydotdev/action-devcard/releases/tag/2.0.0
[1.2.0]: https://github.com/ombratteng/action-devcard/compare/1.1.1...1.2.0
[1.1.1]: https://github.com/ombratteng/action-devcard/compare/1.1.0...1.1.1
[1.1.0]: https://github.com/ombratteng/action-devcard/compare/1.0.0...1.1.0
[1.0.0]: https://github.com/ombratteng/action-devcard/releases/tag/1.0.0
