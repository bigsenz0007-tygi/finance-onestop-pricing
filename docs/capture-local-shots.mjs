/**
 * 本地 5189 走查截图（需先 npm run serve:dev）
 * node docs/capture-local-shots.mjs
 */
import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(__dirname, 'walkthrough-assets/local')
const BASE = 'http://127.0.0.1:5189/'

const shots = [
  {
    name: 'local-pricing-list',
    async run(page) {
      await page.goto(BASE)
      await page.getByRole('button', { name: '价格管理' }).hover()
      await page.getByText('一站定价', { exact: true }).click()
      await page.waitForTimeout(800)
    }
  },
  {
    name: 'local-pricing-create',
    async run(page) {
      await page.getByRole('button', { name: '新建场景定价' }).click()
      await page.waitForTimeout(800)
    }
  },
  {
    name: 'local-quoting-list',
    async run(page) {
      await page.goto(BASE)
      await page.getByRole('button', { name: '报价管理' }).hover()
      await page.getByText('场景报价', { exact: true }).click()
      await page.waitForTimeout(800)
    }
  },
  {
    name: 'local-billing-list',
    async run(page) {
      await page.goto(BASE)
      await page.getByRole('button', { name: '价格管理' }).hover()
      await page.getByText('计费要素', { exact: true }).click()
      await page.waitForTimeout(800)
    }
  },
  {
    name: 'local-biztype-list',
    async run(page) {
      await page.goto(BASE)
      await page.getByRole('button', { name: '价格管理' }).hover()
      await page.getByText('业务场景', { exact: true }).click()
      await page.waitForTimeout(800)
    }
  }
]

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

for (const shot of shots) {
  try {
    await shot.run(page)
    await page.screenshot({ path: path.join(OUT, `${shot.name}.png`), fullPage: false })
    console.log('ok', shot.name)
  } catch (e) {
    console.warn('skip', shot.name, e.message)
  }
}

await browser.close()
