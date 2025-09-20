;(window as any).global = window

// Optional but handy if a lib later expects Buffer/process:
import { Buffer } from 'buffer'
;(window as any).Buffer = Buffer
;(window as any).process = { env: {} } as any