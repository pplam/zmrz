import 'babel-polyfill'
import rp from 'request-promise'
import crypto from 'crypto'

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
    // delete opts.sign_type
    const signature = this.sign(this.obj2qs(opts))
    // opts.sign_type = this.options.sign_type
    opts.sign = signature
    console.log(opts)

    return await rp({
      method: 'POST',
      uri: this.config.url,
      body: opts,
      json: true,
    })
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
    const qs = this.obj2qs(opts)
    const signature = this.sign(qs)

    return `${this.config.url}?${qs}&sign=${signature}`
  }

  sign(input, key = this.config.appPrivateKey) {
    return crypto
      .createSign('RSA-SHA256')
      .update(input, 'utf8')
      .sign(key, 'base64')
  }

  verify(expected, sign, key = this.config.alipayPublicKey) {
    return crypto
      .createVerify('RSA-SHA256')
      .update(expected, 'utf8')
      .verify(key, sign, 'base64')
  }

  obj2qs(obj) {
    const sorted = Object
      .keys(obj)
      .sort()
      .reduce((r, k) => {
        r[k] = obj[k]
        return r
      }, {})

    return Object
      .entries(sorted)
      .filter(([, value]) => ![null, ''].includes(value))
      .map(([key, value]) => `${key}=${value}`)// encodeURIComponent(value)}`)
      .join('&')
  }
}
