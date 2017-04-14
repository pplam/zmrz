'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-polyfill');

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _crypto = require('crypto');

var _crypto2 = _interopRequireDefault(_crypto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function timestampISO() {
  return new Date().toISOString().substr(0, 19).replace('T', ' ');
}

function nowTimeStr() {
  return new Date().toISOString().substr(0, 19).replace(/[^\d]/g, '');
}

function randStr(len, chars) {
  var str = '';
  chars = chars || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
  for (var i = 0; i < len; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

var _class = function () {
  function _class() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, _class);

    this.config = Object.assign({
      url: 'https://openapi.alipay.com/gateway.do'
    }, config);
    this.options = Object.assign({
      charset: 'utf-8',
      sign_type: 'RSA2',
      version: '1.0'
    }, opts);
  }

  _createClass(_class, [{
    key: 'init',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(realName, idCardNO) {
        var opts, signature;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                opts = Object.assign({
                  method: 'zhima.customer.certification.initialize',
                  timestamp: timestampISO(),
                  biz_content: JSON.stringify({
                    transaction_id: 'ZMRZ' + nowTimeStr() + randStr(14),
                    product_code: 'w1010100000000002978',
                    biz_code: 'FACE',
                    identity_param: JSON.stringify({
                      identity_type: 'CERT_INFO',
                      cert_type: 'IDENTITY_CARD',
                      cert_name: realName,
                      cert_no: idCardNO
                    })
                  })
                }, this.options);
                // delete opts.sign_type

                signature = this.sign(this.buildQs(opts));
                // opts.sign_type = this.options.sign_type

                opts.sign = signature;

                _context.next = 5;
                return (0, _requestPromise2.default)({
                  method: 'POST',
                  uri: this.config.url,
                  body: opts,
                  json: true
                });

              case 5:
                return _context.abrupt('return', _context.sent);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function init(_x3, _x4) {
        return _ref.apply(this, arguments);
      }

      return init;
    }()
  }, {
    key: 'getUrl',
    value: function getUrl(bizNO, returnUrl) {
      var opts = Object.assign({
        method: 'zhima.customer.certification.certify',
        timestamp: timestampISO(),
        return_url: returnUrl,
        biz_content: JSON.stringify({
          biz_no: bizNO
        })
      }, this.options);
      var qs = this.obj2qs(opts);
      var signature = this.sign(qs);

      return this.config.url + '?' + qs + '&sign=' + signature;
    }
  }, {
    key: 'sign',
    value: function sign(input) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.config.appPrivateKey;

      return _crypto2.default.createSign('RSA-SHA256').update(input, 'utf8').sign(key.toString(), 'base64');
    }
  }, {
    key: 'verify',
    value: function verify(expected, sign) {
      var key = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.config.alipayPublicKey;

      return _crypto2.default.createVerify('RSA-SHA256').update(expected, 'utf8').verify(key.toString(), sign, 'base64');
    }
  }, {
    key: 'buildQs',
    value: function buildQs(obj) {
      var sorted = Object.keys(obj).sort().reduce(function (r, k) {
        r[k] = obj[k];
        return r;
      }, {});

      return Object.entries(sorted).filter(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            value = _ref3[1];

        return ![null, undefined, ''].includes(value);
      }).map(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            key = _ref5[0],
            value = _ref5[1];

        if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') return key + '=' + JSON.stringify(value);
        return key + '=' + value;
      }).join('&');
    }
  }]);

  return _class;
}();

exports.default = _class;