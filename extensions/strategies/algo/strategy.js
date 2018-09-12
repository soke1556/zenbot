var z = require('zero-fill')
  , n = require('numbro')
  , ema = require('../../../lib/ema')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'algo',
  description: 'Cannot tell that much.',

  getOptions: function () {
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
    var request = require('request');
    request('https://www.dropbox.com/s/twv9pc8t1g36v4i/BTCUSD-3500.json?dl=1', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body)
            if(data.action == "short"){
              if (s.trend !== 'down') {
                s.acted_on_trend = false
              }
              s.trend = 'down'
              s.signal = !s.acted_on_trend ? 'sell' : null
            }
            else {
              if(data.action == "long"){
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