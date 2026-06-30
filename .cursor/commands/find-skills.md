# Find Skills Command

Discover and install agent skills for specialized work.

## Usage

`/find-skills [query]`

## Implementation

1. Load [`.agents/skills/find-skills/SKILL.md`](.agents/skills/find-skills/SKILL.md)
2. Run Skill Discovery agent: [`.agents/skills/maser-lab-threejs/references/agents/skill-discovery.md`](.agents/skills/maser-lab-threejs/references/agents/skill-discovery.md) for Three.js projects
3. CLI:

```bash
npx skills find [query]
npx skills add <owner/repo@skill> -y
npx skills check
```

Browse: https://skills.sh/

## Three.js default bundle

```bash
npx skills add cloudai-x/threejs-skills -y
```

Verify all APIs against [threejs.org/docs](https://threejs.org/docs/).
