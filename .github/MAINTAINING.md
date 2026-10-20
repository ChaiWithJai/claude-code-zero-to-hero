# Maintaining the learner experience

Keep the front door small: setup once, choose a path, choose a lab, practice.

- The launcher has no runtime packages to install and never invokes Git.
- A workspace is initialized by copying missing files, never overwriting an attempt.
- Homework and extensions must open with their own inputs before the core lab is completed.
- Examples stay behind an explicit request. Do not reveal them as a side effect of preparation.
- Private notes, generated results, and progress belong in ignored folders.
- Keep course-design decisions, original source curriculum, instructor production records, and commercial operations outside this learner repository.
- The catalog controls the live and signature paths. The live route includes a loop demonstration before guided practice; the full signature route follows the numeric lab order.
- `npm test` checks path resolution, file preservation, CSV feedback, and CLI recovery. CI covers supported Node versions on Linux, macOS, and Windows. Actual Claude execution and a learner pilot remain separate checks.
- Browser and account integration execution are optional extensions. Do not add a required connector to the local-file core.

## Design references

The interaction is inspired by [Kent C. Dodds’s Bookshelf `node go` exercise flow](https://github.com/kentcdodds/bookshelf#working-through-the-exercises) and [Epicshop’s workshop navigation](https://github.com/epicweb-dev/epicshop). This is an original small launcher, not a fork, dependency, or claim of affiliation. No code from those projects was copied.
