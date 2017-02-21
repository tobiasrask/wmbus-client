# wmbus-client
Wireless M-Bus client is a JavaScript library for reading, logging, processing
and distributing wM-Bus meter telegrams.

This experimental IoT-project aims to provide basic meter reading and reporting.
Collected data can be logged or distributed to external services over internet,
making your environment to be part of Internet of Things.


### Meters and readers

Wireless M-Bus meter is a device that measures for example water or gas consumption.
After reading the value, meter sends this information in small packets called
radio-telegrams. Radio frequency and telegram structure depends on your meter
type and and so called Mode.

To be able to collect data you need a physical wM-Bus reader. Reader is a device
that listens radio telegrams and broadcast this data for your computer.

Incoming telegrams are usually well formatted using schemas and frames. But
because there is no one standard for the payload, the actual content may vary
from meter type and manufacturer. Usually large amount of information is coded
into few bytes and it might not be easy to find out how the data should be
decoded back to something meaninful.

Usually the payload of telegram is encrypted using AES and and you need the
meter specific secret key to be able to decrypt the data.


### Collecting and processing wM-Bus data

This library provides util components for some known meters and readers.

Incoming data from reader device is buffered by "Reader component". Intact raw
telegrams can be processed from queue. Usually this data is stored and logged,
or it can be sent over the internet.

To be able to parse data from certain telegram we need low level support for the
particular manufacturer and meter. This is called "Meter component", which reads
telegrams from our Reader component and converts the information from payload to
something meaninful, like current temperature or total water concumption.


### Usage

TODO: Add more examples how to use configuration.


Here is example configuration for meters you are about to read. You need to
specify manufacturer name, serial number, version and device type. These fields
are known as Meter ID, which is an unique identifier for single meter.

If telegram payload is encrypted, you need also AES key.

```js
// meters.json
[
  {
    "manufacturer": "KAM",
    "serial": "00000000",
    "version": "1b",
    "deviceType": "06",
    "aes": "0000000000000000",
    "label": "My meter"
   }
]
```




### Supported meters and readers
At the moment it supports Kamstrup Multical 21 water meters and AMBER wM-Bus
Module AMB8465-M. It should work also with other Amber modules like AMB8426-M,
AMB8626-M, AMB3626-M and AMB3636-M.

Please contribute to get more readers and meters.


## Example application

Source repository contains one simple example application. Run application with
command:

```js
    $ READER_METHOD=collect node run-consumption-example.js
```




## How to get started with Wireless M-Bus
To get started with wM-Bus, check out these links:

[Introduction to wireless M-Bus - PDF](http://pages.silabs.com/rs/634-SLU-379/images/introduction-to-wireless-mbus.pdf)

[Application note - PDF](http://www.st.com/content/ccc/resource/technical/document/application_note/3f/fb/35/5a/25/4e/41/ba/DM00233038.pdf/files/DM00233038.pdf/jcr:content/translations/en.DM00233038.pdf)

M-Bus documentation: [http://www.m-bus.com](http://www.m-bus.com)




## Test
Run tests using [npm](https://www.npmjs.com/):

    $ npm run test
