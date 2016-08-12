#!/usr/bin/env python3

"""Generate bell onset times from a data feed"""

import requests, json, datetime
import numpy as np
import signal_processing as sp
from housepy import util, chart, log
from collections import OrderedDict


# get the data from the last hour
t = util.timestamp()
start_dt = util.dt(t, tz="America/New_York")
start_dt -= datetime.timedelta(hours=1)#, days=1)
start_ds = str(start_dt)

stop_dt = start_dt + datetime.timedelta(hours=1)
stop_ds = str(stop_dt)

data = []
try:
    page = 1
    while True:
        query = "http://54.235.200.47/tower,server/%s/%s/%s" % (start_ds, stop_ds, page)
        log.info(query)
        results = requests.get(query).json()['results']
        if not len(results):
            break
        data += results
        page += 1
    assert len(data)
except Exception as e:
    log.error(e)
    exit()


# separate the data entries into parameters
# this order determines bell order, which is low to high
signals = OrderedDict()
signals['tide'] = [(d['t_utc'], d['tide_height_ft']) for d in data if 'sun_deg' in d]
signals['sun'] = [(d['t_utc'], d['sun_deg']) for d in data if 'sun_deg' in d]
signals['wind'] = [(d['t_utc'], d['wind_speed_mph']) for d in data if 'wind_speed_mph' in d]
signals['pressure'] = [(d['t_utc'], d['pressure_pa']) for d in data if 'pressure_pa' in d]
signals['humidity'] = [(d['t_utc'], d['humidity_per']) for d in data if 'humidity_per' in d]
signals['temperature'] = [(d['t_utc'], d['temperature_f']) for d in data if 'temperature_f' in d]
signals['light'] = [(d['t_utc'], d['light_v']) for d in data if 'light_v' in d]

RANGE = {   'sun': (0.0, 80),
            'tide': (-2.0, 5.5),
            'wind': (0, 20.0),
            'pressure': (100322.75, 102226.75),
            'humidity': (10, 95),
            'temperature': (60, 100),
            'light': (0, 5),
        }

# process each signal
output = []
for key, signal in signals.items():
    if not len(signal):
        continue
    ts, signal = zip(*signal)
    signal = sp.resample(ts, signal)
    signal = sp.normalize(sp.smooth(signal), RANGE[key][0], RANGE[key][1])
    # chart.plot(signal, linewidth=2)    
    signal = sp.integral(signal)
    signal = sp.normalize(signal, 0, 240)
    signal *= 240
    # chart.plot(signal, linewidth=2)
    num_strikes = int(np.floor(np.max(signal))) + 1
    flipped = sp.flip(signal, num_samples=num_strikes)
    # chart.plot(flipped, linewidth=2)
    # print(flipped)
    # print(sp.delta(flipped))
    output.append((key, list(flipped)))
# chart.show("charts/", labels=True)
# print(json.dumps(output, indent=4))


# write as a javascript object
with open("bell_data.js", 'w') as f:
    f.write("var data = " + json.dumps(output) + ";")



"""
How to get onset times from a time-series / continuous values? 

First, scale each data signal to between 0-1 given the appropriate range.

Then, create a monotonic position function from a signal by taking the integral
x is time, y is position (position aka, distance, or position in a pattern, or bell strike)

(if you wanted two patterns to converge, you'd then normalize each integrated signal separately)

Consider a max rate of bell ringing. Let's say 4hz.
If a data stream is at the top of its range the whole time, that's 4hz for 1 minute, which is 240 strikes.

So we can normalize all the integrated signals to 240.

Each strike is supposed to be evenly distributed on this curve, ie, the y value for a given t aka x.

So, if we flip the curve and downsample it to the number of strikes, each sample is thus the time of each strike.
If we take a delta on that, we have the timing intervals, if we want those instead.

Note that this implicitly converted minutes (since we knew that is the sampling rate in the data) to seconds.

...the nice result is that all the bells sound together at the beginning, and again at the end.

"""
