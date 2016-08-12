# Swale Databell

Pull data from the Swale API and create a browser-based sonification using p5.js

Requires:
`https://github.com/brianhouse/housepy`  
`https://github.com/brianhouse/signal_processing`  

Set up `generate_bell_data.py` in a cronjob slightly before the hour.  
`59 * * * * generate_bell_data.py`

To test:
`python3 -m http.server` and navigate to http://localhost:8000


### Copyright/License

Copyright (c) 2016 Brian House

This code is released under the MIT License and is completely free to use for any purpose. See the LICENSE file for details.
