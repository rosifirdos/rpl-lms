import EmbeddedPostgres from 'embedded-postgres';

const pg = new EmbeddedPostgres({
  port: 5433,
  user: 'postgres',
  password: 'password',
  database: 'rpl_lms',
  persistent: true,
});

async function main() {
  await pg.start();
  console.log('PostgreSQL running on port 5433');
  process.on('SIGINT', async () => {
    await pg.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await pg.stop();
    process.exit(0);
  });
  setInterval(() => {}, 10000);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
