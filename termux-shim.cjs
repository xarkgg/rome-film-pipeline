// Termux shim: playwright-core's registry rejects process.platform === 'android'.
// Pretend to be linux before playwright-core is loaded.
Object.defineProperty(process, 'platform', { value: 'linux' })
