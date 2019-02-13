const path = require('path');
const fs = require('fs');
const throng = require('throng');
const logger = require('./common/utils/logger');
const server = require('./server');

const pidFile = path.join(__dirname, '/.start.pid');
const fileOptions = { encoding: 'utf-8' };
let pid;
const db = require('./common/utils/db');
const config = require('./common/config/index');


/**
 * Throng is a wrapper around node cluster
 * https://github.com/hunterloftis/throng
 */
function createDB() {
  try {
    logger.info('Syncing db');
    db.sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    db.sequelize.import('./common/models/UserSessions');
    db.sequelize.sync().done();
  } catch (e) {
    logger.error('Failed to sync db');
    logger.error(e);
  }
}
function start() {
  createDB();
  throng({
    workers: process.env.NODE_WORKER_COUNT || 1,
    master: startMaster,
    start: startWorker,
  });
}

/**
   * Start master process
   */
function startMaster() {
  logger.info(`Master started. PID: ${process.pid}`);
  process.on('SIGINT', () => {
    logger.info('Master exiting');
    process.exit();
  });
}

/**
   * Start cluster worker. Log start and exit
   * @param  {Number} workerId
   */
function startWorker(workerId) {
  server.start();
  logger.info(`Started worker ${workerId}, PID: ${process.pid}`);
  logger.info(`Started worker ${workerId}, PID: ${process.title}`);
  process.on('SIGINT', () => {
    logger.info(`Worker ${workerId} exiting...`);
    process.exit();
  });
}

/**
   * Make sure all child processes are cleaned up
   */
function onInterrupt() {
  logger.info('Ensuring all child processes are cleaned up');
  pid = fs.readFileSync(pidFile, fileOptions);
  fs.unlink(pidFile);
  logger.info('Cleaning up child processed');
  logger.info(`closing process:${pid}`);
  process.kill(pid, 'SIGTERM');
  process.exit(); // eslint-disable-line unicorn/no-process-exit
}

/**
   * Keep track of processes, and clean up on SIGINT
   */
function monitor() {
  fs.writeFileSync(pidFile, process.pid, fileOptions);
  process.on('SIGINT', onInterrupt);
}

monitor();
start();
