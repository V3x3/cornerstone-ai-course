const REQUIRED_TOKENS = ['--g1','--g2','--g3','--g4','--bg','--bg2','--text1','--text2','--text3']

test('all required CSS tokens are defined in globals.css', async () => {
  const fs = await import('fs')
  const css = fs.readFileSync('styles/globals.css', 'utf-8')
  REQUIRED_TOKENS.forEach(token => {
    expect(css).toContain(token)
  })
})
