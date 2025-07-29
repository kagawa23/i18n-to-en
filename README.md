# i18n Properties Sync GitHub Action

This repository contains a GitHub Action that automatically synchronizes changes from `i18n.properties` to `i18n_en.properties` when a pull request is merged.

## How It Works

1. When a pull request that modifies `i18n/i18n.properties` is merged, the GitHub Action is triggered.
2. The action analyzes the changes made to `i18n.properties` in the PR.
3. It then applies those changes to `i18n_en.properties`:
   - New keys added to `i18n.properties` are added to `i18n_en.properties`
   - Modified keys in `i18n.properties` are updated in `i18n_en.properties`
   - Keys deleted from `i18n.properties` are removed from `i18n_en.properties`
4. A new pull request is created with these changes, with user `zczhaozc` added as a reviewer.
5. The new PR includes a reference to the original PR that triggered the sync.

## Features

- Automatically detects changes in `i18n.properties` files
- Handles additions, modifications, and deletions of properties
- Creates a new PR with the synchronized changes
- Adds specified reviewer to the new PR
- Links back to the original PR for traceability

## Requirements

- GitHub repository with `i18n.properties` and `i18n_en.properties` files
- GitHub Actions enabled for the repository
- Write permissions for the GitHub token to create new branches and PRs

## Implementation Details

The action uses Node.js with the `simple-git` package to:
1. Extract the PR number and merge commit information
2. Analyze the diff between the source and target branches
3. Parse the properties files and identify changes
4. Apply the changes to the `i18n_en.properties` file
5. Create a new branch and PR with the changes

## Customization

If you need to customize this action, you can modify:
- The paths to the properties files
- The reviewer username
- The PR title and description format
- The branch naming convention for the sync PRs 