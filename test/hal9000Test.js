const expect = require('chai').expect;
const hal9k = require('../src/hal9k.js');

describe('resource', () => {
    it('exists', () => {
        expect(hal9k.resource).to.not.be.undefined;
    });

    it('creates HALObject with links', () => {
        let actual = hal9k.resource()
            .link('self', '/example/href')
            .toJSON();
        let expectation = {
            _links: {
                self: {
                    href: '/example/href'
                }
            }
        };
        expect(actual).to.eql(expectation);

        actual = hal9k.resource()
            .link('self', '/example/href/2')
            .toJSON();
        expectation = {
            _links: {
                self: {
                    href: '/example/href/2'
                }
            }
        };
        expect(actual).to.eql(expectation);
    });

    it('creates HALObject with links using optional parameters', () => {
        const actual = hal9k.resource()
            .link('self', '/example/href', {
                templated: false,
                type: 'json',
                deprecation: 'url/to/further/information/concerning/deprecation',
                name: 'sample name'
            })
            .toJSON();
        const expectation = {
            _links: {
                self: {
                    href: '/example/href',
                    templated: false,
                    type: 'json',
                    deprecation: 'url/to/further/information/concerning/deprecation',
                    name: 'sample name'
                }
            }
        };
        expect(actual).to.eql(expectation);
    });

    it('creates HALObject with multiple links with the same relation', () => {
      const actual = hal9k.resource()
          .link('self', '/orders')
          .link('items', ['/first_item', '/second_item'])
          .toJSON();
      const expectation = {
          _links: {
              self: {
                  href: '/orders'
              },
              items: [{
                  href: '/first_item'
              },{
                  href: '/second_item'
              }]
            }
      };
      expect(actual).to.eql(expectation);
  });

    it('creates HALObject with link relations', () => {
        const actual = hal9k.resource()
            .link('self', '/orders')
            .curie('acme', 'http://docs.acme.com/relations/{rel}')
            .link('acme:widgets', '/widgets')
            .toJSON();
        const expectation = {
            _links: {
                self: {
                    href: '/orders'
                },
                curies: [{
                    name: 'acme',
                    href: 'http://docs.acme.com/relations/{rel}',
                    templated: true
                }],
                'acme:widgets': {
                    href: '/widgets'
                }
            }

        };
        expect(actual).to.eql(expectation);
    });

    it('creates HALObject with linkTemplates', () => {
        const actual = hal9k.resource()
            .linkTemplate('find', '/orders{?id}')
            .toJSON();
        const expectation = {
            _links: {
                find: {
                    href: '/orders{?id}',
                    templated: true,
                }
            }
        };
        expect(actual).to.eql(expectation);
    });

    it('creates HALObject with state', () => {
        let actual = hal9k.resource()
            .link('self', '/example/href')
            .toJSON();
        let expectation = {
            _links: {
                self: {
                    href: '/example/href'
                }
            }
        };
        expect(actual).to.eql(expectation);

        actual = hal9k.resource()
            .state({
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
            })
            .toJSON();
        expectation = {
            key1: 'value1',
            key2: 'value2',
            key3: 'value3',
        };
        expect(actual).to.eql(expectation);
    });

    it('creates HALObject with links and state', () => {
        const actual = hal9k.resource()
            .link('self', '/example/href')
            .state({
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
            })
            .toJSON();
        const expectation = {
            _links: {
                self: {
                    href: '/example/href'
                }
            },
            key1: 'value1',
            key2: 'value2',
            key3: 'value3',
        };
        expect(actual).to.eql(expectation);
    });

    it('creates HALObject with embedded resource Object', () => {
        const embeddedResource = hal9k.resource()
            .link('self', '/example/href')
            .state({
                key1: 'value1',
                key2: 'value2',
                key3: 'value3',
            });

        const actual = hal9k.resource()
            .embed('exampleRel', embeddedResource)
            .toJSON();

        const expectation = {
            _embedded: {
                exampleRel: {
                    _links: {
                        self: {
                            href: '/example/href'
                        }
                    },
                    key1: 'value1',
                    key2: 'value2',
                    key3: 'value3',
                }
            }
        };
        expect(actual).to.eql(expectation);
    });

    it('creates HALObject with embedded resource Object Array', () => {
        const embeddedResource1 = hal9k.resource()
            .link('self', '/example/href/1')
            .state({
                key1: 'value1',
            });
        const embeddedResource2 = hal9k.resource()
            .link('self', '/example/href/2')
            .state({
                key1: 'value2',
            });

        const actual = hal9k.resource()
            .embed('exampleRel', [embeddedResource1, embeddedResource2])
            .toJSON();

        const expectation = {
            _embedded: {
                exampleRel: [{
                    _links: {
                        self: {
                            href: '/example/href/1'
                        }
                    },
                    key1: 'value1',
                }, {
                    _links: {
                        self: {
                            href: '/example/href/2'
                        }
                    },
                    key1: 'value2',
                }, ]
            }
        };
        expect(actual).to.eql(expectation);
    });


});

describe('fromJSON', () => {
    it('exists', () => {
        expect(hal9k.fromJSON).to.not.be.undefined;
    });

    it('automatically converts string to Object', () => {
        const input = `{
            "_links": {
                "self": {
                    "href": "/orders"
                }
              }
        }`;
        const expectation = hal9k.resource()
        .link('self', '/orders');
        const actual = hal9k.fromJSON(input);
        expect(actual).to.eql(expectation);
    });

    it('throws exception when invalid JSON given', () => {
        const input = `{
            _links: {
                self: {
                    href: "/orders"
                }
              }
        }`;
        const expectation = hal9k.resource()
        .link('self', '/orders');
        expect(hal9k.fromJSON.bind(hal9k, input))
        .to.throw('valid JSON string or resource object expected');

    });

    it('converts json to hal object', () => {
        let input = {
            "_links": {
                "self": {
                    "href": "/orders"
                },
                "next": {
                    "href": "/orders?page=2"
                },
                "find": {
                    "href": "/orders{?id}",
                    "templated": true
                }
            },
            "_embedded": {
                "orders": [{
                    "_links": {
                        "self": {
                            "href": "/orders/123"
                        },
                        "basket": {
                            "href": "/baskets/98712"
                        },
                        "customer": {
                            "href": "/customers/7809"
                        }
                    },
                    "total": 30.00,
                    "currency": "USD",
                    "status": "shipped",
                }, {
                    "_links": {
                        "self": {
                            "href": "/orders/124"
                        },
                        "basket": {
                            "href": "/baskets/97213"
                        },
                        "customer": {
                            "href": "/customers/12369"
                        }
                    },
                    "total": 20.00,
                    "currency": "USD",
                    "status": "processing"
                }]
            },
            "currentlyProcessing": 14,
            "shippedToday": 20
        };
        let expectation = hal9k.resource({
                currentlyProcessing: 14,
                shippedToday: 20
            })
            .link('self', '/orders')
            .link('next', '/orders?page=2')
            .link('find', '/orders{?id}', {
                templated: true
            })
            .embed('orders', [hal9k.resource({
                    total: 30.00,
                    currency: 'USD',
                    status: 'shipped'
                })
                .link('self', '/orders/123')
                .link('basket', '/baskets/98712')
                .link('customer', '/customers/7809'),
                hal9k.resource({
                    total: 20.00,
                    currency: 'USD',
                    status: 'processing'
                })
                .link('self', '/orders/124')
                .link('basket', '/baskets/97213')
                .link('customer', '/customers/12369')
            ]);
        let actual = hal9k.fromJSON(input);
        expect(actual).to.eql(expectation);
        input = {
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
        };
        expectation = hal9k.resource({
                "currency": "USD",
                "status": "shipped",
                "total": 10.20
            })
            .link('self', '/orders/523')
            .link('warehouse', '/warehouse/56')
            .link('invoice', '/invoices/873');
        actual = hal9k.fromJSON(input);
        expect(actual).to.eql(expectation);

    });

    it('creates HALObject from JSON with multiple links with the same relation', () => {
      const input = {
          _links: {
              self: {
                  href: '/orders'
              },
              items: [{
                  href: '/first_item'
              },{
                  href: '/second_item'
              }]
            }
      };
      const expectation = hal9k.resource()
      .link('self', '/orders')
      .link('items', ['/first_item', '/second_item']);
      const actual = hal9k.fromJSON(input);
      expect(actual).to.eql(expectation);
  });

    it('what if we give json with link Relation', () => {
        const input = {
         _links: {
           self: { href: '/orders' },
           curies: [{
             name: 'acme',
             href: 'http://docs.acme.com/relations/{rel}',
             templated: true
           }],
           'acme:widgets': { href: '/widgets' }
         }
       };
        const expectation = hal9k.resource()
        .link('self', '/orders')
        .curie('acme', 'http://docs.acme.com/relations/{rel}')
        .link('acme:widgets', '/widgets');
        const actual = hal9k.fromJSON(input);
        expect(actual).to.eql(expectation);
    });
});

describe('isValidHAL', () => {
    it('exists', () => {
        expect(hal9k.isValidHAL).to.not.be.undefined;
    });



    it('valid Hal doesnt report any errors or warnings', () => {
        const input = hal9k.fromJSON({
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
        const actual = hal9k.isValidHAL(input);
        expect(actual.warnings.length).to.be.equal(0);
        expect(actual.errors.length).to.be.equal(0);
    });

    it('also accepts pure json objects', () => {
        let actual = hal9k.isValidHAL(`{
            "_links": {
                "warehouse": {
                },
                "invoice": {
                    "href": "/invoices/873"
                }
            },
            "currency": "USD",
            "status": "shipped",
            "total": 10.20
        }`);
        expect(actual.warnings.length).to.be.equal(1);
        expect(actual.errors.length).to.be.equal(1);

        actual = hal9k.isValidHAL(`{
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
        }`);
        expect(actual.warnings.length).to.be.equal(0);
        expect(actual.errors.length).to.be.equal(0);
    });

    it('throws exception when passed invalid JSON', () => {
        const input = `{
            _links: {
                self: {
                    href: /orders/523
                },
                warehouse: {
                    href: /warehouse/56
                },
                invoice: {
                    href: /invoices/873
                }
            },
            currency: USD,
            status: shipped,
            total: 10.20
        }`;
        expect(hal9k.isValidHAL.bind(hal9k, input)).to.throw(Error);
    });

    it('report warning on missing self Link', () => {
        const input = hal9k.fromJSON({
            "_links": {
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
        const actual = hal9k.isValidHAL(input);
        expect(actual.warnings.length).to.be.equal(1);
        expect(actual.errors.length).to.be.equal(0);
        expect(actual.warnings[0]).eql({
            resourceRel: 'root',
            title: 'missing self link',
            description: 'Each Resource Object SHOULD contain a self link.'
        });
    })

    it('report warning on missing self Link in embedded resource', () => {
        const input = hal9k.fromJSON({
            "_links": {
                "self": {
                    "href": "/orders/523"
                },
            }
        });
        input.embed('myResource' ,hal9k.resource());
        const actual = hal9k.isValidHAL(input);
        expect(actual.warnings.length).to.be.equal(1);
        expect(actual.errors.length).to.be.equal(0);
        expect(actual.warnings[0]).eql({
            resourceRel: 'myResource',
            title: 'missing self link',
            description: 'Each Resource Object SHOULD contain a self link.'
        });
    })

    it('report error on missing href in Link', () => {
        const input = hal9k.fromJSON({
            "_links": {
                "self": {
                },
            }
        });
        const actual = hal9k.isValidHAL(input);
        expect(actual.warnings.length).to.be.equal(0);
        expect(actual.errors.length).to.be.equal(1);
        expect(actual.errors[0]).eql({
            resourceRel: 'root',
            title: 'missing href in link',
            description: 'The "href" property is REQUIRED.'
        });
    });

    it('report error on missing {rel} in curies href', () => {
        const input = hal9k.resource()
        .link('self', 'orders/01')
        .curie('exampleRel', 'noRelInBla');
        const actual = hal9k.isValidHAL(input);
        expect(actual.warnings.length).to.be.equal(0);
        expect(actual.errors.length).to.be.equal(1);
        expect(actual.errors[0]).eql({
            resourceRel: 'root',
            title: 'missing {rel} in url-template href',
            description: 'Curies url-templates MUST contain a {rel} token'
        });
    });

    it('report error on missing href in Link in embedded resource', () => {
        const input = hal9k.fromJSON({
            "_links": {
                "self": {
                    "href": "/orders/523"
                },
            }
        });
        input.embed('myResource' , hal9k.resource()
        .link('self', '/orders/0101')
        .link('testLink', {}));
        const actual = hal9k.isValidHAL(input);
        expect(actual.warnings.length).to.be.equal(0);
        expect(actual.errors.length).to.be.equal(1);
        expect(actual.errors[0]).eql({
            resourceRel: 'myResource',
            title: 'missing href in link',
            description: 'The "href" property is REQUIRED.'
        });
    });
});
