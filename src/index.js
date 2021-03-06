import 'babel-polyfill'
import rp from 'request-promise'
import crypto from 'crypto'
import qs from 'querystring'

function timestampISO() {
  return new Date()
    .toISOString()
    .substr(0, 19)
    .replace('T', ' ')
}

function nowTimeStr() {
  return new Date()
    .toISOString()
    .substr(0, 19)
    .replace(/[^\d]/g, '')
}

function randStr(len, chars) {
  let str = ''
  chars = chars || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'
  for (let i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return str
}

export default class {
  constructor(config = {}, opts = {}) {
    this.config = Object.assign({
      url: 'https://openapi.alipay.com/gateway.do',
    }, config)
    this.options = Object.assign({
      charset: 'utf-8',
      sign_type: 'RSA2',
      version: '1.0',
    }, opts)
  }

  async init(realName, idCardNO) {
    const opts = Object.assign({
      method: 'zhima.customer.certification.initialize',
      timestamp: timestampISO(),
      biz_content: JSON.stringify({
        transaction_id: `ZMRZ${nowTimeStr()}${randStr(14)}`,
        product_code: 'w1010100000000002978',
        biz_code: 'FACE',
        identity_param: JSON.stringify({
          identity_type: 'CERT_INFO',
          cert_type: 'IDENTITY_CARD',
          cert_name: realName,
          cert_no: idCardNO,
        }),
      }),
    }, this.options)

    const signature = this.sign(this.buildQs(opts))
    opts.sign = signature

    const url = `${this.config.url}?${qs.stringify(opts)}`

    return await rp(url)
  }

  getUrl(bizNO, returnUrl) {
    const opts = Object.assign({
      method: 'zhima.customer.certification.certify',
      timestamp: timestampISO(),
      return_url: returnUrl,
      biz_content: JSON.stringify({
        biz_no: bizNO,
      }),
    }, this.options)

    const signature = this.sign(this.buildQs(opts))
    opts.sign = signature

    return `${this.config.url}?${qs.stringify(opts)}`
  }

  sign(input, key = this.config.appPrivateKey) {
    return crypto
      .createSign('RSA-SHA256')
      .update(input, 'utf8')
      .sign(key.toString(), 'base64')
  }

  verify(expected, sign, key = this.config.alipayPublicKey) {
    return crypto
      .createVerify('RSA-SHA256')
      .update(expected, 'utf8')
      .verify(key.toString(), sign, 'base64')
  }

  buildQs(obj) {
    const sorted = Object
      .keys(obj)
      .sort()
      .reduce((r, k) => {
        r[k] = obj[k]
        return r
      }, {})

    return Object
      .entries(sorted)
      .filter(([, value]) => ![null, undefined, ''].includes(value))
      .map(([key, value]) => {
        if (typeof value === 'object') return `${key}=${JSON.stringify(value)}`
        return `${key}=${value}`
      })
      .join('&')
  }
}
