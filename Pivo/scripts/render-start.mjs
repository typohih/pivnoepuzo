import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const viteBin = fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url))
const port = process.env.PORT || '4173'

const child = spawn(process.execPath, [viteBin, 'preview', '--host', '0.0.0.0', '--port', port], {
    stdio: 'inherit',
    env: process.env
})

child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal)
        return
    }

    process.exit(code ?? 0)
})
