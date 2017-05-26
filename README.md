[![coliquio](https://www.coliquio.de/images/logo_coliquio_extern.png)](https://www.coliquio/jobs)
[![Build Status](https://travis-ci.org/coliquio/hal9k.svg?branch=master)](https://travis-ci.org/coliquio/hal9k)

# hal9k - coliquio's internal HAL library

A pure JavaScript library for creating, modifying and validating HAL conform objects
based on [draft-kelly-json-hal-08](https://tools.ietf.org/html/draft-kelly-json-hal-08)

## Requirements

- [Node.js](https://nodejs.org) >= 6.1.0

## Installation

    npm install hal9k

## Example

### Basic Resource

```
const hal9k = require('hal9k');
hal9k.resource()
.link('self', '/order/123')
.state({
    "currency": "USD",
    "status": "shipped",
    "total": 10.20
});
```

# API

## hal9k

```
const hal9k = require('hal9k');
```

### hal9k.fromJSON(json) - Create a resource  from JSON

```
// As object...
hal9k.fromJSON({
 _links: {
   self: { href: '/orders' },
   curies: [{
     name: 'acme',
     href: 'http://docs.acme.com/relations/{rel}',
     templated: true
   }],
   'acme:widgets': { href: '/widgets' }
 }
});

// or as string.
hal9k.fromJSON('{
    "_links": {
        "self": {
            "href": "/orders/523"
        },
        "warehouse": {
            "href": "/warehouse/56"
        },
        "invoice": {
            "href": "/invoices/873"
        }
    },
    "currency": "USD",
    "status": "shipped",
    "total": 10.20
}');
```

### hal9k.isValidHal(json) - Validates resource syntax and structure

##### Possible inputs

```
// As json string...
hal9k.isValidHAL('{
    "_links": {
        "self": {
            "href": "/orders/523"
        },
        "warehouse": {
            "href": "/warehouse/56"
        },
        "invoice": {
            "href": "/invoices/873"
        }
    },
    "currency": "USD",
    "status": "shipped",
    "total": 10.20
}');

// as json object...
hal9k.isValidHAL({
    "_links": {
        "self": {
            "href": "/orders/523"
        },
        "warehouse": {
            "href": "/warehouse/56"
        },
        "invoice": {
            "href": "/invoices/873"
        }
    },
    "currency": "USD",
    "status": "shipped",
    "total": 10.20
});

// or as resource object
hal9k.isValidHAL(
    hal9k.resource({
        "currency": "USD",
        "status": "shipped",
        "total": 10.20
    })
    .link('self', '/orders/523')
    .link('warehouse', '/warehouse/56')
    .link('invoice', '/invoices/873')
);
```

##### Possible outputs

```
// valid Hal
{
    warnings: [],
    errors: []
}
// with warnings
{
    warnings: [
        {
            resourceRel: 'root',
            title: 'missing self link',
            description: 'Each Resource Object SHOULD contain a self link.'
        }
    ],
    errors: []
}
// with errors
{
    warnings: [],
    errors: [
        {
            resourceRel: 'yourResource',
            title: 'missing href in link',
            description: 'The "href" property is REQUIRED.'
        }
    ]
}
```

### hal9k.resource(data) - Create a resource object

```
// creates an empty resource
hal9k.resource();

// resource with state
hal9k.resource({
    "currency": "USD",
    "status": "shipped",
    "total": 10.20
});
```

## The resource object chains

### .link(rel, href, optionalParams) - Add links

*optionalParams:  
href,
templated,
type,
deprecation,
name,
profile,
title,
hreflang*

```
hal9k.resource()
.link('self', '/example/href/2');

hal9k.resource()
.link('self', '/example/href', {
    type: 'json',
    deprecation: 'url/to/further/information/concerning/deprecation',
    name: 'sample name'
});

hal9k.resource()
.link('self', {
    href: '/example/href',
    type: 'json',
    deprecation: 'url/to/further/information/concerning/deprecation',
    name: 'sample name'
});

hal9k.resource()
.link('items', [
    '/first_item',
    '/second_item'
]);
```

### .embed(rel, resource) - Embed resources

```
hal9k.resource()
.link('self', '/example/href/2')
.embed('order', hal9k.resource());

hal9k.resource()
.link('self', '/example/href/2')
.embed('orders', [
    hal9k.resource(),
    hal9k.resource()
]);
```

### .state(data) - Add state

```
hal9k.resource()
.link('self', '/example/href/2')
.state({
    key1: 'value1',
    key2: 'value2',
    key3: 'value3',
});
```

### .toJSON() - Returns valid HAL-JSON-Object (end of chain)

##### Input

```
hal9k.resource({
    "currency": "USD",
    "status": "shipped",
    "total": 10.20
})
.link('self', '/orders/523')
.link('warehouse', '/warehouse/56')
.link('invoice', '/invoices/873')
.toJSON();
```

##### Result

```
{
 "_links": {
   "self": { "href": "/orders/523" },
   "warehouse": { "href": "/warehouse/56" },
   "invoice": { "href": "/invoices/873" }
 },
 "currency": "USD",
 "status": "shipped",
 "total": 10.20
}
```

### .curie(name, href) - Add a link relation abbreviated via CURIE syntax

##### Input

```
hal9k.resource()
.link('self', '/orders')
.curie('acme', 'http://docs.acme.com/relations/{rel}')
.link('acme:widgets', '/widgets')
.toJSON();
```

##### Result

```
{
    "_links": {
        "self": {
            "href": "/orders"
        },
        "curies": [{
            "name": "acme",
            "href": "http://docs.acme.com/relations/{rel}",
            "templated": true
        }],
        "acme:widgets": {
            "href": "/widgets"
        }
    }
}
```

## License

See [LICENSE](LICENSE).

## About

[<img src="https://www.coliquio.de/images/logo_coliquio_extern.png">][coliquio.jobs]

[coliquio][coliquio.jobs] ist mit über 170.000 registrierten Ärzten<br>
aller Fachrichtungen das größte Ärzte-Netzwerk im deutschsprachigen Raum.<br>

[coliquios][coliquio.jobs] Applikationslandschaft setzt auf eine moderne Microservice-basierte<br>
Architektur. Standardisierte API sind daher ein großer und   wichtiger Teil unserer<br>
Arbeit. HAL (Hypertext Application Language) hilft uns unsere API von innen<br>
heraus zu entdecken und erleichtert das schnelle Arbeiten mit den Schnittstellen.<br>
Ein wichtiger Faktor um unsere Produktivität zu erhöhen. Diese Library ist nach<br>
dem neuesten [HAL Draft][draft] erstellt worden.<br>

[coliquio][coliquio.jobs] is today with over 170,000 physicians of all disciplines<br>
the largest medical community in the German-speaking world.<br>

[coliquios][coliquio.jobs] application landscape is based on a modern microservice<br>
architecture. Standardized APIs are therefore a large and important part of our<br>
business.
HAL (Hypertext Application Language) helps us to discover our APIs<br>
and facilitate fast working with our interfaces.<br>
It's an important factor to increase our productivity.<br>
This library has been created according to the latest [HAL Draft][draft].

[draft]: https://tools.ietf.org/html/draft-kelly-json-hal-08
[coliquio.jobs]: https://www.coliquio.de/jobs

## Disclaimer

This is a project for the community, from developers for developers. This is NOT an official coliquio product. I.e. Maintenance and support are provided by the individual developers but not officially by coliquio.
