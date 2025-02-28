#!/bin/zsh

## @brief SSO login & role assumption to AWS
## @usage awslogin
awslogin() {
    aws sso login --profile sso-profile-dev;
    eval $(aws-sso-creds export --profile sso-profile-dev) && echo "## Done"
}

## @brief Updates Business Logic (BL) dependencies
## @usage updateBL
updateBL() {
    npm outdated | grep '@safebooks.ai/' | awk '{print $1"@latest"}' | xargs npm install
    npm list | grep '@safebooks.ai/'
}

## @brief Publishes an experimental npm version
## @usage npmrc
npmrc() {
    npm version pre
    npm run build
    npm publish --tag experimental;
}

## @brief Removes all local branches that have been merged into the currently checked out branch
## @usage gitclean
gitclean() {
    git branch --merged | grep -Ev "(^\*|^\+|master|main|dev)" | xargs --no-run-if-empty git branch -d
}

## @brief Checkout a new branch and push it to origin
## @usage gitgo <branch-name>
## @param branch-name The name of the new branch to create and push
## @example gitgo feature-branch
gitgo() {
    git checkout -b "$1"
    git push --set-upstream origin "$1"
}

## @brief Checkout main and pull latest changes
## @usage gitref
gitref() {
    git checkout main
    git pull
}

## @brief Sync current branch with latest main
## @usage gitsync
gitsync() {
    gitref
    git checkout -
    git merge main
}

## @brief Show last N active branches
## @usage gitactive <N>
## @param N The number of branches to show (default: 5)
## @example gitactive 10
gitactive() {
    local n=${1:-5}  # Default to 5 if no argument is provided

    # Function to truncate text longer than 30 chars
    truncate() {
        local str="$1"
        local max_length=50
        if [[ ${#str} -gt $max_length ]]; then
            echo "${str:0:$((max_length-3))}..."
        else
            echo "$str"
        fi
    }

    awk '
        BEGIN {
            printf "\n\033[1m%-50s %-50s %-12s\033[0m\n", "Branch", "Last Commit", "Date"
            printf "%-50s %-50s %-12s\n", "------", "-----------", "----"
        }
    '

    git for-each-ref --sort=-committerdate --format="%(refname:short)|%(subject)|%(committerdate:short)" refs/heads | head -n "$n" | while IFS='|' read -r branch commit date; do
        printf "%-50s %-50s %-12s\n" "$(truncate "$branch")" "$(truncate "$commit")" "$date"
    done
}

## @brief Run an npm manual release candidate publish workflow from BL repo
## @usage rcbl <npm_tag>
## @params 
## -@npm_tag The npm tag to use for the release
## -@mega_nest
## --@name hello
## --@value world
## @example rcbl latest
rcbl() {
    local current_branch=$(git rev-parse --abbrev-ref HEAD) # Get current branch name
    gh workflow run npm_manual_rc_publish.yml \
    --ref "$current_branch" \
    -f npm_tag="$1"
}

## @brief Show the latest version of the BL package
## @usage rci
rci() {
    version=$(npm view @safebooks.ai/business-logic | grep $(git branch --show-current) | tail -n 1 | sed 's/.*://' | tr -d ' ') && echo "npm i @safebooks.ai/business-logic@$version"
}

## @brief Reload the current .zshrc file
## @usage zreset
zreset(){
    source ~/.zshrc
}

## @brief List all functions defined in the .zshrc file with their descriptions
## @usage zl
zl() {
    awk '
        BEGIN {
            printf "\n\033[1m%-20s %s\033[0m\n", "Function", "Description"
            printf "%-20s %s\n", "--------", "-----------"
        }
        /^#/ { 
            comment = substr($0, 3)
        }
        /^[a-zA-Z0-9_-]+\(\) {/ {
            fname = substr($0, 1, length($0)-4)
            if (comment) {
                printf "%-20s %s\n", fname, comment
                comment = ""
            } else {
                printf "%-20s %s\n", fname, "-"
            }
        }
        /^$/ { comment = "" }
    ' ~/.zshrc | sort -k1
}
