# Reqs

Install [PNPM](https://pnpm.io):
```
npm i -g pnpm
```

Install [Docker](https://www.docker.com/products/docker-desktop/)

Install [Bun](https://bun.sh) (windows):

```
powershell -c "irm bun.sh/install.ps1 | iex"
```

Install [Turborepo](https://turbo.build/repo/docs) (optional):
```
pnpm i -g turbo
```

# Develop

To develop all apps and packages, run the following command:

```
pnpm dev
```

if you dont need a database for the thing youre working on, you can run:

```
pnpm dev:slim
```

or you can just run things individually:

If you installed turbo:
```
turbo @repo/frontend#dev
```
if you didnt:
```
pnpx turbo @repo/frontend#dev
```

or just navigate to the package and run:
```
pnpm dev
```

## [Monorepo](https://monorepo.tools) structure

# Apps
Apps are located in the `apps/` folder. Each app has its own folder and is a separate app.

# Shared code 
Shared code is located in the `packages/` folder. These are packages that are shared between the different apps.

## Environment
VSCode is recommended for development. The project is set up with some recommended extensions.

## Branches
Use different branches for each feature. The branch name should be descriptive of the feature.
For example, if you are working on a feature that allows users to upload images, you could name the branch `feat/upload-images`.
And create it like so:

```
git checkout -b feat/upload-images
```

Some other labels can be:
- `fix/bug-name` for bug fixes
- `refactor/feature-name` for refactoring
- `chore/task-name` for tasks that don't affect the codebase
Then work on this branch and push it to the remote repository.

## Commits
Commit messages should be descriptive of the changes made in the commit. 
For example, if you added a feature that allows users to upload images, your commit message could be `(feat): add image upload feature`.
Try to have more commits with smaller changes rather than a few commits with many changes.
For example when building an image upload feature some smaller commits could be:
- `(feat): add image upload component`
- `(feat): add image upload API`
- `(feat): add image upload tests`

## Testing
Before pushing, run the following command:

```
pnpm test
```
and then:

(windows powershell)
```powershell
$env:DATABASE_URL = "postgresql://postgres:mypassword@db:5432/postgres"
```
```
pnpm test_prod
```
and check the outputs.

## Submitting a [Pull Request](https://www.youtube.com/watch?v=nCKdihvneS0)
When you are done with a feature, submit a PR to the `main` branch. Make sure to include a description of the feature and any relevant information.

# Build

To build all apps and packages locally, run the following command:
(Altough the above with "pnpm test_prod" should be preferred even when running locally.)

```
pnpm build
```
Then start locally:
```
pnpm start
```
