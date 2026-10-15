# Exposr

social media app that promotes authenticity and intention when it comes to photo-taking.
you're not allowed to edit or change photos. once you take the photo, its sealed until the end of the week
similarly to a digital camera :)

photos are displayed in the form of polaroids, with image processing to look grainy and vintage.

## Local setup (recommended)

Install Node (use nvm) and then run the dependency installs below from the frontend folder.

Install Node LTS via nvm:

```bash
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts
```

Install dependencies and start the dev server (no bundler):

```bash
# from the frontend/ folder
cd frontend

# install runtime + dev deps listed in package.json
npm install

# serve the `public/` folder on http://localhost:3000
npm run start
```

Notes:
- This project is configured without a bundler; files in `public/` are served directly.
- There is no production build step configured — add a bundler or use a separate build pipeline when needed.
- Lint and format commands still available:

```bash
cd frontend
npm run lint
npm run format
```

IN CASE IM SLEEPING/DEAD: 

for actual test dev in terms of profile creations and whatnot, you need to run BOTH the frontend and the backend in separate terminals:

(again, both of these need to be run in two terminals, one for frontend, one for backend)

```bash
# from the frontend/ folder
cd frontend

# install runtime + dev deps listed in package.json
npm install

# serve the `public/` folder on http://localhost:3000
npm run start
```

```bash
# from the backend/ folder
cd backend

# install runtime + dev deps listed in package.json
npm install

# serve the `public/` folder on http://localhost:3000
npm run start
```

