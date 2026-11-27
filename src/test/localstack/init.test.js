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
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        CALL_LOG: log,
        AMG_SQS_QUEUE_NAME: 'amg-queue',
        S3_DOCUMENT_BUCKET_NAME: 'document-bucket',
        SQS_QUEUE_NAME: 'cbp-queue',
        ...overrides,
      },
      encoding: 'utf8',
    });
    return { result, calls: fs.existsSync(log) ? fs.readFileSync(log, 'utf8') : '' };
  }

  it('creates both buckets and all queues when buckets are absent', () => {
    const { result, calls } = run();
    expect(result.status).to.equal(0);
    expect(calls).to.include('--endpoint-url http://sgar-localstack:4566');
    expect(calls).to.include('create-bucket --bucket document-bucket');
    expect(calls).to.include('create-bucket --bucket dev-cdlz-bucket');
    expect(calls).to.include('create-queue --queue-name cbp-queue');
    expect(calls).to.include('create-queue --queue-name amg-queue\n');
    expect(calls).to.include('create-queue --queue-name amg-queue-dlq\n');
  });

  it('reuses existing buckets and fails if queue initialization fails', () => {
    const { result, calls } = run({ BUCKETS_EXIST: 'true', FAIL_QUEUES: 'true' });
    expect(result.status).not.to.equal(0);
    expect(calls).not.to.include('create-bucket');
    expect(calls).to.include('create-queue --queue-name cbp-queue');
    expect(calls).not.to.include('create-queue --queue-name amg-queue');
  });

  it('uses the configured AMG queue name', () => {
    const { result, calls } = run({ AMG_SQS_QUEUE_NAME: 'other-queue' });
    expect(result.status).to.equal(0);
    expect(calls).to.include('create-queue --queue-name other-queue\n');
    expect(calls).to.include('create-queue --queue-name other-queue-dlq\n');
  });

  it('uses the configured document bucket and CBP queue names', () => {
    const { result, calls } = run({
      S3_DOCUMENT_BUCKET_NAME: 'other-bucket',
      SQS_QUEUE_NAME: 'other-queue',
    });
    expect(result.status).to.equal(0);
    expect(calls).to.include('create-bucket --bucket other-bucket');
    expect(calls).to.include('create-queue --queue-name other-queue\n');
  });

  it('requires an AMG queue name before creating resources', () => {
    const { result, calls } = run({ AMG_SQS_QUEUE_NAME: '' });
    expect(result.status).not.to.equal(0);
    expect(calls).to.equal('');
  });

  it('requires the document bucket and CBP queue names before creating resources', () => {
    for (const key of ['S3_DOCUMENT_BUCKET_NAME', 'SQS_QUEUE_NAME']) {
      const { result, calls } = run({ [key]: '' });
      expect(result.status).not.to.equal(0);
      expect(calls).to.equal('');
    }
  });
});
