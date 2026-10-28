# Campus360 Industry Project

This repository contains two independent Campus360 applications.

| Application | Development URL | Command |
| --- | --- | --- |
| Money Management | http://localhost:5173 | `npm run dev:money` |
| Career & College | http://localhost:5174 | `npm run dev:career` |

## First-time setup

Install the dependencies for both applications:

```bash
npm install
npm install --prefix "Career&college"
```

## Run an application

```bash
# Money Management
npm run dev:money

# Career & College
npm run dev:career
```

Run `npm run build` to build both applications. The production outputs are created in `Money Management/dist` and `Career&college/dist`.
