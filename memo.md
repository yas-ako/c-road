# コマンドの履歴

user@DESKTOP-RTJ9GLQ:~/programming/c-road$ npm i --save-dev eslint eslint-plugin-vue

added 72 packages, and audited 916 packages in 3s

160 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
user@DESKTOP-RTJ9GLQ:~/programming/c-road$ npm i --save-dev typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser @nuxtjs/eslint-config-typescript

added 159 packages, and audited 1075 packages in 9s

244 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
user@DESKTOP-RTJ9GLQ:~/programming/c-road$ npm run eslint --init
npm ERR! Missing script: "eslint"
npm ERR! 
npm ERR! To see a list of scripts, run:
npm ERR!   npm run

npm ERR! A complete log of this run can be found in: /home/user/.npm/_logs/2024-03-14T07_21_47_904Z-debug-0.log
user@DESKTOP-RTJ9GLQ:~/programming/c-road$ npx eslint --init
You can also run this command directly using 'npm init @eslint/config'.
Need to install the following packages:
@eslint/create-config@0.4.6
Ok to proceed? (y) y
✔ How would you like to use ESLint? · problems
✔ What type of modules does your project use? · esm
✔ Which framework does your project use? · vue
✔ Does your project use TypeScript? · No / Yes
✔ Where does your code run? · browser
✔ What format do you want your config file to be in? · JavaScript
The config that you've selected requires the following dependencies:

eslint-plugin-vue@latest
✔ Would you like to install them now? · No / Yes
✔ Which package manager do you want to use? · npm
Installing eslint-plugin-vue@latest

up to date, audited 1075 packages in 1s

244 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
Successfully created .eslintrc.cjs file in /home/user/programming/c-road
user@DESKTOP-RTJ9GLQ:~/programming/c-road$ https://zenn.dev/kigi/scraps/a2e38ff5bb0889^C
user@DESKTOP-RTJ9GLQ:~/programming/c-road$ npm i --save-dev prettier eslint-plugin-prettier @vue/eslint-config-prettier

added 8 packages, and audited 1083 packages in 3s

247 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
user@DESKTOP-RTJ9GLQ:~/programming/c-road$ npm install eslint -g -D
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /usr/local/lib/node_modules/eslint
npm ERR! errno -13
npm ERR! Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/eslint'
npm ERR!  [Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/eslint'] {
npm ERR!   errno: -13,
npm ERR!   code: 'EACCES',
npm ERR!   syscall: 'mkdir',
npm ERR!   path: '/usr/local/lib/node_modules/eslint'
npm ERR! }
npm ERR! 
npm ERR! The operation was rejected by your operating system.
npm ERR! It is likely you do not have the permissions to access this file as the current user
npm ERR! 
npm ERR! If you believe this might be a permissions issue, please double-check the
npm ERR! permissions of the file and its containing directories, or try running
npm ERR! the command again as root/Administrator.

npm ERR! A complete log of this run can be found in: /home/user/.npm/_logs/2024-03-14T08_58_35_110Z-debug-0.log
user@DESKTOP-RTJ9GLQ:~/programming/c-road$ sudo npm install eslint -g -D
[sudo] password for user: 

added 99 packages in 4s

23 packages are looking for funding
  run `npm fund` for details
npm notice 
npm notice New minor version of npm available! 10.2.5 -> 10.5.0
npm notice Changelog: https://github.com/npm/cli/releases/tag/v10.5.0
npm notice Run npm install -g npm@10.5.0 to update!
npm notice 
user@DESKTOP-RTJ9GLQ:~/programming/c-road$ npm run dev --o

> dev
> nuxt dev

Nuxt 3.10.3 with Nitro 2.9.1                                                                                                                                                                                                                                      6:12:35 PM
[get-port] Unable to find an available port (tried 3000 on any host). Using alternative port 3001.                                                                                                                                                                6:12:35 PM
                                                                                                                                                                                                                                                                  6:12:35 PM
  ➜ Local:    http://localhost:3001/
  ➜ Network:  use --host to expose

ℹ Using Tailwind CSS from ~/assets/css/tailwind.css                                                                                                                                                                                             nuxt:tailwindcss 6:12:37 PM
ℹ Tailwind Viewer: http://localhost:3001/_tailwind/                                                                                                                                                                                             nuxt:tailwindcss 6:12:37 PM
ℹ Re-optimizing dependencies because lockfile has changed                                                                                                                                                                                                        6:12:38 PM
ℹ Vite server warmed up in 1250ms                                                                                                                                                                                                                                6:12:40 PM
ℹ Vite client warmed up in 1948ms                                                                                                                                                                                                                                6:12:40 PM
✔ Nuxt Nitro server built in 958 ms                                                                                                                                                                                                                        nitro 6:12:41 PM
