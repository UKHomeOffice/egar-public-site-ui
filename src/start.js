const path = require('path');
const fs = require('fs');
const throng = require('throng');
const logger = require('./common/utils/logger')(__filename);
const server = require('./server');

const pidFile = path.join(__dirname, '/.start.pid');
const fileOptions = { encoding: 'utf-8' };
let pid;

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
 * Throng is a wrapper around node cluster
 * https://github.com/hunterloftis/throng
 */
function start() {
  throng({
    workers: process.env.NODE_WORKER_COUNT || 1,
    master: startMaster,
    start: startWorker,
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
  fs.writeFileSync(pidFile, process.pid.toString(), fileOptions);
  process.on('SIGINT', onInterrupt);
}

monitor();
start();
