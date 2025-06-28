#!/usr/bin/env bash
set -o errexit -o pipefail -o nounset

touch ./posts/new.md

this_date="$(date +'%Y-%m-%d')"

cat <<EOF > ./posts/new.md
---
status: draft
date: ${this_date}
title: New Post
description: |
  New description
---

# New Post

\`\`\`javascript
console.log('Hello, World!');
\`\`\`
EOF