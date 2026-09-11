const path = require('path');
const { spawn } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '../../..');

const PYTHON_EXECUTABLE = path.join(
  PROJECT_ROOT,
  '.venv',
  'bin',
  'python'
);

const PREDICT_SCRIPT = path.join(
  PROJECT_ROOT,
  'data',
  'processed',
  'ml',
  'predict_from_json.py'
);

const LOCATION_PREDICT_SCRIPT = path.join(
  PROJECT_ROOT,
  'data',
  'processed',
  'ml',
  'predict_location_from_json.py'
);

const PREDICTION_TIMEOUT_MS = 15000;

function runPythonScript(scriptPath, input) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      PYTHON_EXECUTABLE,
      [scriptPath],
      {
        cwd: PROJECT_ROOT,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    );

    let stdout = '';
    let stderr = '';
    let settled = false;

    const finishReject = (error) => {
      if (settled) return;

      settled = true;
      reject(error);
    };

    const finishResolve = (value) => {
      if (settled) return;

      settled = true;
      resolve(value);
    };

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');

      finishReject(
        new Error('ML prediction service timed out.')
      );
    }, PREDICTION_TIMEOUT_MS);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    child.on('error', (error) => {
      clearTimeout(timeout);

      finishReject(
        new Error(
          `Failed to start ML prediction process: ${error.message}`
        )
      );
    });

    child.on('close', (code) => {
      clearTimeout(timeout);

      if (settled) {
        return;
      }

      if (code !== 0) {
        finishReject(
          new Error(
            `ML prediction process failed with code ${code}: ${
              stderr.trim() || 'Unknown Python error'
            }`
          )
        );

        return;
      }

      try {
        const result = JSON.parse(stdout);

        finishResolve(result);
      } catch (error) {
        finishReject(
          new Error(
            `ML prediction returned invalid JSON: ${error.message}`
          )
        );
      }
    });

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}

function runPythonPrediction(input) {
  return runPythonScript(
    PREDICT_SCRIPT,
    input
  );
}

function runLocationPrediction(input) {
  return runPythonScript(
    LOCATION_PREDICT_SCRIPT,
    input
  );
}

module.exports = {
  runPythonPrediction,
  runLocationPrediction,
};
