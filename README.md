

## Ce este acest backend
Un API NestJS care:
1. expune CRUD pentru tasks (lista task-urilor din uzină),
2. scrie/citește din MariaDB prin TypeORM,
3. emite evenimente în timp real prin WebSocket când se schimbă anumite câmpuri (pentru ecranul de scheduling),
4. are un script de seed/import dintr-un tasks.json (bulk upsert).

## Cum pornește aplicația (runtime flow)
### 1) main.ts
- Creează aplicația Nest.
- Pune ValidationPipe global:
   - validează DTO-urile (class-validator)
   - transformă tipuri (ex: query string → number) (transform: true)
   - curăță câmpuri nepermise (whitelist: true)
- Setează WebSocket adapter (@nestjs/platform-ws).
- Setează CORS pentru Angular local (http://localhost:4200).
- Ascultă pe PORT sau 3000.
### 2) app.module.ts
- Încarcă .env.dev / .env.prod prin ConfigModule.
- Configurează TypeORM (MariaDB) din env:
  - host/port/user/pass/db
  - autoLoadEntities: true
  - synchronize: false (corect pentru DB reală; în dev îl poți pune true doar ca să creezi tabela la început)
- Include:
  - TasksModule (API tasks)
  - RealtimeModule (websocket)
- SchedulingGateway e provider (gateway-ul WS).


## Modulul tasks (inima proiectului)
Structura ta din src/tasks e „clasic curată” Nest:

- entities/task.entity.ts
  - Definește tabela tasks și toate coloanele.
  - Maparea e explicită (ex: clientName → coloană client_name).
  - Ai și @Index() pe câmpuri utile pentru filtrare/sortare.
- dto/*
  - CreateTaskDto: ce accepți la creare (validat).
  - UpdateTaskDto: PartialType(CreateTaskDto) → update parțial (PATCH).
  - QueryTaskDto: filtre + paginare pentru GET /tasks:
    - status, clientName, jobNo, search
    - interval startFrom/startTo
    - offset/limit cu Type(() => Number) ca să nu rămână string.
- tasks.controller.ts expune endpoint-urile:
  - GET /tasks → listă cu filtre & paginare
  - GET /tasks/:id → un task
  - POST /tasks → creare
  - PATCH /tasks/:id → update parțial
  - DELETE /tasks/:id → ștergere
  - POST /tasks/bulk → import/upsert în masă (util pentru seed / sincronizări)

- tasks.service.ts aici e logica reală:
  - Folosește Repository<TaskEntity> (TypeORM).
  - findAll() construiește query cu filtre + Brackets pentru search.
  - create() / update() convertesc datele (startDate/endDate) din string → Date | null.
  - La update() emite WS evenimente doar când e relevant (ex: schimbare ord/wca/statTask → emitStatusChanged, etc.).

## Realtime (web-socket)
src/web-socket/* (RealtimeModule + SchedulingGateway)
- Ideea: când UI schimbă un task (mutare coloană, schimbare status, ord, etc.), serverul:
1. salvează în DB
2. trimite un eveniment WS către clienți
- Asta te ajută ca operatorii să vadă instant schimbările făcute de manager în scheduling.

## Seed / import din JSON
În src/tasks/data:
- tasks.json = un dump de task-uri (format cu _id.$oid, tipic export).
- map-task.ts = adaptor: convertește cheile din JSON (ex: JOB_NO) în câmpuri entity (ex: jobNo), plus conversii number/bool/date.
- seed-tasks.ts:
  - pornește un DataSource TypeORM separat
  - citește tasks.json
  - face insert … orUpdate (upsert) pe cheia id
- Rulezi cu scriptul din package.json:
  - npm run seed:tasks

## Cum “curge” o schimbare tipică (ex: drag&drop în scheduler)

1. Frontend face PATCH /tasks/:id cu { wcaNo, ord, statTask ... }
2. TasksService.update():
   - citește entitatea
   - aplică patch
   - salvează
   - decide ce eveniment WS emite (ca să nu spameze)
3. Clienții conectați primesc WS și își actualizează UI.











#
#
#
#
#
#
#
#
#
#
#
#
#
#
# NestJs
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
