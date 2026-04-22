const fs = require('fs');
const net = require('net');
const path = require('path');

const nextDir = path.join(process.cwd(), '.next');
const devPort = Number(process.env.PORT || '3000');

function canConnect(port, host) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ port, host });
    let settled = false;

    const finish = (callback) => (value) => {
      if (settled) {
        return;
      }

      settled = true;
      socket.destroy();
      callback(value);
    };

    socket.setTimeout(500);
    socket.once('connect', finish(() => resolve(true)));
    socket.once('timeout', finish(() => resolve(false)));
    socket.once('error', finish((error) => {
      if (error && ['ECONNREFUSED', 'EHOSTUNREACH', 'ENETUNREACH', 'ETIMEDOUT'].includes(error.code)) {
        resolve(false);
        return;
      }

      reject(error);
    }));
  });
}

async function ensurePortAvailable(port) {
  const hosts = ['127.0.0.1', '::1'];

  for (const host of hosts) {
    const listening = await canConnect(port, host);
    if (listening) {
      throw new Error(
        `Port ${port} is already in use. Stop the existing frontend dev server before clearing .next.`
      );
    }
  }
}

async function main() {
  try {
    await ensurePortAvailable(devPort);

    if (fs.existsSync(nextDir)) {
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('Cleared .next cache');
    }
  } catch (error) {
    console.warn('Could not fully clear .next cache:', error.message);
    process.exitCode = 1;
  }
}

void main();
