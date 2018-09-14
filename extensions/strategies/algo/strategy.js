var z = require('zero-fill')
  , n = require('numbro')
  , ema = require('../../../lib/ema')
  , Phenotypes = require('../../../lib/phenotype')
  // , slack = require('../../../extensions/notifiers/slack')
  // , ifttt = require('../../../extensions/notifiers/ifttt')
  // , conf = require('../../../conf')

module.exports = {
  name: 'algo',
  description: 'Cannot tell much.',

  getOptions: function () {
    this.option('pair', 'Pair name as expected by algo api. Default: BTCUSD', String, 'BTCUSD')
    this.option('ticks', 'Ticks sizeas expected by algo api. Default: 3500', Number, 3500)

    this.option('period', 'period length, same as --period_length', String, '1m')
    this.option('period_length', 'period length, same as --period', String, '1m')
    this.option('min_periods', 'min. number of history periods', Number, 3000)
    this.option('baseline_periods', 'lookback periods for volatility baseline', Number, 3000)
    this.option('trigger_factor', 'multiply with volatility baseline EMA to get trigger value', Number, 1.6)
  },

  calculate: function (s) {
    ema(s, 'baseline', s.options.baseline_periods, 'abs_speed')
  },

  onPeriod: function (s, cb) {
    var request = require('request')
    
    // This async gets and prints the current balance as follows: { asset: 0, currency: 1000, asset_hold: 0, currency_hold: 0 }
    // s.exchange.getBalance({currency: s.currency, asset: s.asset}, function (err, balance) {
    //   console.log(balance)
    // })

    request('https://www.dropbox.com/s/twv9pc8t1g36v4i/' + s.options.pair.toUpperCase() + '-' + s.options.ticks + '.json?dl=1', function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var data = JSON.parse(body)
        if(data.action == 'short'){
          if (s.trend !== 'down') {
            s.acted_on_trend = false
          }
          s.trend = 'down'
          s.signal = !s.acted_on_trend ? 'sell' : null
        }
        else {
          if(data.action == 'long'){
            if (s.trend !== 'up') {
              s.acted_on_trend = false
            }
            s.trend = 'up'
            s.signal = !s.acted_on_trend ? 'buy' : null
          }
          else{
            if(s.trend == 'up')
              s.signal = 'sell'
          }
        }
        // This is how to send notifications to Slack.
        //slack(conf).pushMessage('zenbot trade', '*' + s.options.pair.toUpperCase() + '* at *' + s.options.ticks + '*')
        // ifttt(conf.notifiers.ifttt).pushMessage('zenbot trade', '*' + s.options.pair.toUpperCase() + '* at *' + s.options.ticks + '*')
      }
    })
    // if (typeof s.period.baseline === 'number') {
    //   if (s.period.speed >= s.period.baseline * s.options.trigger_factor) {
    //     if (s.trend !== 'up') {
    //       s.acted_on_trend = false
    //     }
    //     s.trend = 'up'
    //     s.signal = !s.acted_on_trend ? 'buy' : null
    //   }
    //   else if (s.period.speed <= s.period.baseline * s.options.trigger_factor * -1) {
    //     if (s.trend !== 'down') {
    //       s.acted_on_trend = false
    //     }
    //     s.trend = 'down'
    //     s.signal = !s.acted_on_trend ? 'sell' : null
    //   }
    // }
    cb()
  },

  onReport: function (s) {
    var cols = []
    cols.push(z(8, n(s.period.speed).format('0.0000'), ' ')[s.period.speed >= 0 ? 'green' : 'red'])
    if (typeof s.period.baseline === 'number') {
      cols.push(z(8, n(s.period.baseline).format('0.0000'), ' ').grey)
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    min_periods: Phenotypes.Range(1, 100),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    baseline_periods: Phenotypes.Range(1, 5000),
    trigger_factor: Phenotypes.RangeFloat(0.1, 10)
  }
}