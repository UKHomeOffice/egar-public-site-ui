const { expect } = require('chai');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

describe('LocalStack initialization', function () {
  this.timeout(10000);
  let directory;
  let log;

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), 'egar-localstack-test-'));
    log = path.join(directory, 'calls');
    fs.writeFileSync(
      path.join(directory, 'awslocal'),
      `#!/bin/sh
echo "$*" >> "$CALL_LOG"
case "$*" in
  *head-bucket*) [ "$BUCKETS_EXIST" = "true" ] ;;
  *create-queue*) [ "$FAIL_QUEUES" != "true" ] ;;
  *) exit 0 ;;
esac
`,
      { mode: 0o755 }
    );
  });

  afterEach(() => {
    fs.rmSync(directory, { recursive: true, force: true });
  });

  function run(overrides = {}) {
    const result = spawnSync('sh', [path.resolve(__dirname, '../../../scripts/init-localstack.sh')], {
      env: { ...process.env, PATH: `${directory}:${process.env.PATH}`, CALL_LOG: log, ...overrides },
      encoding: 'utf8',
    });
    return { result, calls: fs.readFileSync(log, 'utf8') };
  }

  it('creates both buckets and all queues when buckets are absent', () => {
    const { result, calls } = run();
    expect(result.status).to.equal(0);
    expect(calls).to.include('create-bucket --bucket dev-sgar-bucket');
    expect(calls).to.include('create-bucket --bucket dev-cdlz-bucket');
    expect(calls).to.include('create-queue --queue-name egar-dev-sqs');
    expect(calls).to.include('create-queue --queue-name egar-gateway');
    expect(calls).to.include('create-queue --queue-name egar-gateway-dlq');
  });

  it('reuses existing buckets and fails if queue initialization fails', () => {
    const { result, calls } = run({ BUCKETS_EXIST: 'true', FAIL_QUEUES: 'true' });
    expect(result.status).not.to.equal(0);
    expect(calls).not.to.include('create-bucket');
    expect(calls).to.include('create-queue --queue-name egar-dev-sqs');
    expect(calls).not.to.include('create-queue --queue-name egar-gateway');
  });
});
