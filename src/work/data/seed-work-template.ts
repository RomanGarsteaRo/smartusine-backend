
import { DataSource } from 'typeorm';

/*

DB seed
{"0":[],"1":[{"sMin":420,"eMin":1440}],"2":[{"sMin":0,"eMin":150},{"sMin":420,"eMin":1440}],"3":[{"sMin":0,"eMin":150},{"sMin":420,"eMin":1440}],"4":[{"sMin":0,"eMin":150},{"sMin":420,"eMin":1440}],"5":[{"sMin":0,"eMin":150},{"sMin":420,"eMin":720}],"6":[]}
*/


// const ds = new DataSource({
//     type: 'mariadb',
//     host: process.env.DB_HOST,
//     port: +(process.env.DB_PORT || 3306),
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME || 'usinajfr',
//     entities: [WorkWeekTemplateEntity],
//     synchronize: true, // <-- aici e “one-shot” pentru a crea tabela
// });
//
// async function run() {
//     await ds.initialize();
//
//     const repo = ds.getRepository(WorkWeekTemplateEntity);
//     const count = await repo.count();
//
//     if (count === 0) {
//         await repo.save(repo.create({
//             name: 'Default 19.5h',
//             timezone: 'America/Montreal',
//             week: {
//                 '0': [],
//                 '1': [{ sMin: 435, eMin: 1170 }],
//                 '2': [{ sMin: 435, eMin: 1170 }],
//                 '3': [{ sMin: 435, eMin: 1170 }],
//                 '4': [{ sMin: 435, eMin: 1170 }],
//                 '5': [{ sMin: 435, eMin: 1170 }],
//                 '6': [],
//             },
//             version: 1,
//         }));
//         console.log('✅ work_week_template created + default inserted');
//     } else {
//         console.log(`ℹ️ templates already exist: ${count}`);
//     }
//
//     await ds.destroy();
// }
//
// run().catch(e => { console.error(e); process.exit(1); });